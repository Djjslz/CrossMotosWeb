<script>
  import { onMount } from 'svelte';
  import { api, limpiarSesion } from '../../lib/api.js';
  import { formatCOP } from '../../lib/format.js';
  import { showToast } from '../store.svelte.js';

  let { onLogout = () => {} } = $props();

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

  async function entregarPedido(item) {
    if (!confirm(`¿Marcar el pedido ${item.numero} como entregado?`)) return;
    cambiando[item._id] = true;
    try {
      const data = await api.put(`/pedidos/${item._id}/estado`, { estado: 'entregado' });
      item.estado = data.estado;
      showToast(`Pedido ${item.numero} entregado`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      cambiando[item._id] = false;
    }
  }

  function salir() {
    limpiarSesion();
    onLogout();
  }

  onMount(cargar);
</script>

<section class="container section">
  <div class="admin-head">
    <div>
      <h2>Mis pedidos</h2>
      <p>Gestiona la entrega de pedidos asignados.</p>
    </div>
    <button class="btn btn-outline btn-sm" onclick={salir}>Cerrar sesión</button>
  </div>

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
    <div class="error-box">
      <span>{error}</span>
      <button class="btn btn-outline btn-sm" onclick={cargar}>Reintentar</button>
    </div>
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
            <th>Vendedor</th>
            <th>Estado</th>
            <th>Acción</th>
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
                <span class="meta-inline">{item.vendedor || '—'}</span>
              </td>
              <td>
                <span class="badge-estado badge-{item.estado}">{etiquetasEstado[item.estado]}</span>
              </td>
              <td>
                {#if item.estado === 'confirmado'}
                  <button
                    class="mini-btn confirm"
                    disabled={cambiando[item._id]}
                    onclick={(e) => {
                      e.stopPropagation();
                      entregarPedido(item);
                    }}
                  >
                    Entregar
                  </button>
                {:else}
                  <span class="meta-inline">—</span>
                {/if}
              </td>
            </tr>
            {#if expandido === item._id}
              <tr class="detail-row">
                <td colspan="6">
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
                      {#if item.vendedor}
                        <div>
                          <span class="k">Vendedor</span>
                          <div class="v">{item.vendedor}</div>
                        </div>
                      {/if}
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
</section>