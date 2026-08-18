<script>
  import { onMount } from 'svelte';
  import { api } from '../../lib/api.js';
  import { formatCOP } from '../../lib/format.js';
  import { showToast } from '../store.svelte.js';

  let items = $state([]);
  let pagination = $state({ page: 1, total: 0, totalPages: 1, limit: 10 });
  let cargando = $state(true);
  let error = $state('');
  let filtroEstado = $state('');
  let expandido = $state(null);
  let cambiando = $state({});

  const etiquetasEstado = {
    recibido: 'Recibido',
    cotizado: 'Cotizado',
    confirmado: 'Confirmado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };

  function formatearFecha(iso) {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async function cargar() {
    cargando = true;
    error = '';
    try {
      const q = new URLSearchParams({ page: pagination.page, limit: pagination.limit });
      if (filtroEstado) q.set('estado', filtroEstado);
      const data = await api.get(`/pedidos?${q}`);
      items = data?.data ?? [];
      pagination = data?.pagination ?? pagination;
    } catch (err) {
      error = err.message;
    } finally {
      cargando = false;
    }
  }

  function cambiarPagina(p) {
    if (p < 1 || p > pagination.totalPages) return;
    pagination.page = p;
    cargar();
  }

  function alternarFiltro() {
    pagination.page = 1;
    cargar();
  }

  function toggleExpandido(id) {
    expandido = expandido === id ? null : id;
  }

  async function cambiarEstado(item, estado) {
    cambiando[item._id] = true;
    try {
      const data = await api.put(`/pedidos/${item._id}/estado`, { estado });
      item.estado = data.estado;
      showToast(`Pedido ${item.numero} → ${etiquetasEstado[data.estado]}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      cambiando[item._id] = false;
    }
  }

  async function eliminar(item) {
    if (!confirm(`¿Eliminar el pedido ${item.numero}?`)) return;
    try {
      await api.del(`/pedidos/${item._id}`);
      items = items.filter((i) => i._id !== item._id);
      pagination.total = Math.max(0, pagination.total - 1);
      showToast(`Pedido ${item.numero} eliminado`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  onMount(cargar);
</script>

<div class="admin-toolbar">
  <h3>Pedidos</h3>
  <select class="select" bind:value={filtroEstado} onchange={alternarFiltro} aria-label="Filtrar por estado">
    <option value="">Todos los estados</option>
    {#each Object.entries(etiquetasEstado) as [valor, etiqueta]}
      <option value={valor}>{etiqueta}</option>
    {/each}
  </select>
</div>

{#if error}
  <div class="error-box">{error}</div>
{/if}

{#if cargando}
  <div class="loading"><div class="spinner"></div><p>Cargando pedidos...</p></div>
{:else if items.length === 0}
  <div class="empty-state">
    <p>No hay pedidos{ filtroEstado ? ` en estado "${etiquetasEstado[filtroEstado]}"` : '' }.</p>
  </div>
{:else}
  <div class="table-wrap">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Pedido</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {#each items as item (item._id)}
          <tr class="expandable-row" onclick={() => toggleExpandido(item._id)}>
            <td>
              <div class="table-name">
                <strong>{item.numero}</strong>
                <span class="meta-inline">{formatearFecha(item.createdAt)}</span>
              </div>
            </td>
            <td>
              <div class="table-name">
                <strong>{item.cliente.nombre}</strong>
                <span class="meta-inline">{item.cliente.telefono}{item.cliente.ciudad ? ` · ${item.cliente.ciudad}` : ''}</span>
              </div>
            </td>
            <td class="mono">
              <strong>{formatCOP(item.total)}</strong>
              <div class="meta-inline">{item.items.length} ítem(s)</div>
            </td>
            <td>
              <span class="badge-estado badge-{item.estado}">{etiquetasEstado[item.estado]}</span>
            </td>
          </tr>
          {#if expandido === item._id}
            <tr class="detail-row">
              <td colspan="4">
                <div class="detail-box">
                  <div class="detail-grid">
                    <div>
                      <span class="k">Entrega</span>
                      <div class="v">{item.tipoEntrega === 'envio' ? 'Envío' : 'Recojo en tienda'}</div>
                    </div>
                    <div>
                      <span class="k">Contacto</span>
                      <div class="v">{item.medioContacto}</div>
                    </div>
                    <div>
                      <span class="k">Email</span>
                      <div class="v">{item.cliente.email || '—'}</div>
                    </div>
                    <div>
                      <span class="k">Dirección</span>
                      <div class="v">{item.cliente.direccion || '—'}</div>
                    </div>
                    {#if item.cliente.notas}
                      <div>
                        <span class="k">Notas</span>
                        <div class="v">{item.cliente.notas}</div>
                      </div>
                    {/if}
                  </div>

                  <div class="order-items">
                    <table>
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cant.</th>
                          <th>Precio</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {#each item.items as it (it._id)}
                          <tr>
                            <td>
                              <div class="table-name">
                                <strong>{it.nombre}</strong>
                                <span class="meta-inline">SKU {it.sku}</span>
                              </div>
                            </td>
                            <td>{it.cantidad}</td>
                            <td class="mono">{formatCOP(it.precio)}</td>
                            <td class="mono">{formatCOP(it.subtotal)}</td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>

                  <div class="row-actions">
                    {#if item.estado !== 'cotizado' && item.estado !== 'cancelado' && item.estado !== 'entregado'}
                      <button
                        class="mini-btn"
                        disabled={cambiando[item._id]}
                        onclick={(e) => {
                          e.stopPropagation();
                          cambiarEstado(item, 'cotizado');
                        }}
                      >
                        Cotizar
                      </button>
                    {/if}
                    {#if item.estado === 'recibido' || item.estado === 'cotizado'}
                      <button
                        class="mini-btn confirm"
                        disabled={cambiando[item._id]}
                        onclick={(e) => {
                          e.stopPropagation();
                          cambiarEstado(item, 'confirmado');
                        }}
                      >
                        Confirmar
                      </button>
                    {/if}
                    {#if item.estado === 'confirmado'}
                      <button
                        class="mini-btn"
                        disabled={cambiando[item._id]}
                        onclick={(e) => {
                          e.stopPropagation();
                          cambiarEstado(item, 'entregado');
                        }}
                      >
                        Entregar
                      </button>
                    {/if}
                    {#if item.estado !== 'cancelado' && item.estado !== 'entregado'}
                      <button
                        class="mini-btn danger"
                        disabled={cambiando[item._id]}
                        onclick={(e) => {
                          e.stopPropagation();
                          cambiarEstado(item, 'cancelado');
                        }}
                      >
                        Cancelar
                      </button>
                    {/if}
                    <button
                      class="mini-btn danger"
                      onclick={(e) => {
                        e.stopPropagation();
                        eliminar(item);
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>

  {#if pagination.totalPages > 1}
    <div class="pagination">
      <button
        class="page-btn"
        disabled={pagination.page <= 1}
        onclick={() => cambiarPagina(pagination.page - 1)}
      >
        ←
      </button>
      {#each Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1) as p (p)}
        <button class="page-btn" class:active={p === pagination.page} onclick={() => cambiarPagina(p)}>
          {p}
        </button>
      {/each}
      <button
        class="page-btn"
        disabled={pagination.page >= pagination.totalPages}
        onclick={() => cambiarPagina(pagination.page + 1)}
      >
        →
      </button>
    </div>
  {/if}
{/if}