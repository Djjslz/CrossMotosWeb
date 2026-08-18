<script>
  import { onMount } from 'svelte';
  import { api, limpiarSesion } from '../../lib/api.js';
  import { formatCOP } from '../../lib/format.js';
  import { showToast } from '../store.svelte.js';
  import AdminPedidos from './AdminPedidos.svelte';
  import AdminMensajes from './AdminMensajes.svelte';

  let { onLogout = () => {} } = $props();

  let vista = $state('inventario');

  let items = $state([]);
  let pagination = $state({ page: 1, total: 0, totalPages: 1, limit: 10 });
  let cargando = $state(true);
  let error = $state('');
  let busqueda = $state('');
  let guardando = $state({});

  async function cargar() {
    cargando = true;
    error = '';
    try {
      const q = new URLSearchParams({ page: pagination.page, limit: pagination.limit });
      if (busqueda.trim()) q.set('busqueda', busqueda.trim());
      const data = await api.get(`/inventario?${q}`);
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

  async function guardarPrecio(item, event) {
    const nuevo = Number(event.target.value);
    if (isNaN(nuevo) || nuevo < 0) return;
    guardando[item._id] = true;
    try {
      await api.put(`/productos/${item.producto._id}`, { precio: nuevo });
      item.producto.precio = nuevo;
      showToast(`Precio actualizado: ${item.producto.nombre}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      guardando[item._id] = false;
    }
  }

  async function guardarStock(item, event) {
    const nuevo = Math.round(Number(event.target.value));
    if (isNaN(nuevo) || nuevo < 0) return;
    const ajuste = nuevo - item.stock;
    if (ajuste === 0) return;
    guardando[item._id] = true;
    try {
      await api.put(`/inventario/${item._id}`, { ajuste });
      item.stock = nuevo;
      item.stockBajo = nuevo <= item.stockMinimo;
      showToast(`Stock ajustado a ${nuevo}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      guardando[item._id] = false;
    }
  }

  async function guardarStockMinimo(item, event) {
    const nuevo = Math.round(Number(event.target.value));
    if (isNaN(nuevo) || nuevo < 0) return;
    guardando[item._id] = true;
    try {
      await api.put(`/inventario/${item._id}`, { stockMinimo: nuevo });
      item.stockMinimo = nuevo;
      item.stockBajo = item.stock <= nuevo;
      showToast(`Stock mínimo actualizado a ${nuevo}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      guardando[item._id] = false;
    }
  }

  async function toggleDestacado(item) {
    guardando[item._id] = true;
    try {
      await api.put(`/productos/${item.producto._id}`, { destacado: !item.producto.destacado });
      item.producto.destacado = !item.producto.destacado;
      showToast(item.producto.destacado ? 'Marcado como destacado' : 'Quitado de destacados');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      guardando[item._id] = false;
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
      <h2>Panel de administración</h2>
      <p>Gestiona precios y stock de los productos.</p>
    </div>
    <button class="btn btn-outline btn-sm" onclick={salir}>Cerrar sesión</button>
  </div>

  <div class="admin-tabs">
    <button class="tab-btn" class:active={vista === 'inventario'} onclick={() => (vista = 'inventario')}>
      Inventario
    </button>
    <button class="tab-btn" class:active={vista === 'pedidos'} onclick={() => (vista = 'pedidos')}>
      Pedidos
    </button>
    <button class="tab-btn" class:active={vista === 'mensajes'} onclick={() => (vista = 'mensajes')}>
      Mensajes
    </button>
  </div>

  {#if vista === 'inventario'}
    <div class="catalog-toolbar">
    <form
      class="nav-search"
      style="max-width:100%;flex:1"
      onsubmit={(e) => {
        e.preventDefault();
        pagination.page = 1;
        cargar();
      }}
    >
      <svg class="search-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        type="text"
        bind:value={busqueda}
        placeholder="Buscar por SKU o nombre..."
        aria-label="Buscar producto"
      />
    </form>
    <span class="catalog-result">
      {cargando ? 'Cargando...' : `${pagination.total} producto${pagination.total === 1 ? '' : 's'}`}
    </span>
  </div>

  {#if error}
    <div class="error-box">{error}</div>
  {/if}

  {#if cargando}
    <div class="loading"><div class="spinner"></div><p>Cargando inventario...</p></div>
  {:else}
    <div class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>SKU</th>
            <th>Precio (COP)</th>
            <th>Stock</th>
            <th>Stock mín.</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {#each items as item (item._id)}
            <tr class:stock-bajo={item.stockBajo}>
              <td>
                <div class="table-product">
                  <div class="cart-thumb">
                    {#if item.producto.imagenes && item.producto.imagenes.length}
                      <img src={item.producto.imagenes[0]} alt="" />
                    {:else}
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5c5a66" stroke-width="1.5">
                        <rect x="4" y="3" width="16" height="18" rx="2" />
                        <path d="M8 8h8M8 12h8M8 16h4" />
                      </svg>
                    {/if}
                  </div>
                  <div>
                    <strong class="table-name">{item.producto.nombre}</strong>
                    <div class="table-actions">
                      <button
                        class="link-btn"
                        class:active={item.producto.destacado}
                        disabled={guardando[item._id]}
                        onclick={() => toggleDestacado(item)}
                      >
                        {item.producto.destacado ? '★ Destacado' : '☆ Destacar'}
                      </button>
                    </div>
                  </div>
                </div>
              </td>
              <td class="mono">{item.sku}</td>
              <td>
                <div class="price-input">
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    value={item.producto.precio}
                    onchange={(e) => guardarPrecio(item, e)}
                    aria-label="Precio"
                  />
                </div>
              </td>
              <td>
                <input
                  class="num-input"
                  type="number"
                  min="0"
                  value={item.stock}
                  onchange={(e) => guardarStock(item, e)}
                  aria-label="Stock"
                />
              </td>
              <td>
                <input
                  class="num-input"
                  type="number"
                  min="0"
                  value={item.stockMinimo}
                  onchange={(e) => guardarStockMinimo(item, e)}
                  aria-label="Stock mínimo"
                />
              </td>
              <td>
                {#if guardando[item._id]}
                  <span class="saving">Guardando...</span>
                {:else if item.stockBajo}
                  <span class="badge badge-bajo">Stock bajo</span>
                {:else}
                  <span class="badge badge-ok">Disponible</span>
                {/if}
              </td>
            </tr>
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
  {:else if vista === 'pedidos'}
    <AdminPedidos />
  {:else}
    <AdminMensajes />
  {/if}
</section>
