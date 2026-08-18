<script>
  import { onMount } from 'svelte';
  import { navigate, getProductos } from '../../lib/router.js';
  import { categorias, cargarCategorias } from '../store.svelte.js';
  import ProductCard from '../components/ProductCard.svelte';

  let { query = {} } = $props();

  let productos = $state([]);
  let pagination = $state({ page: 1, total: 0, totalPages: 1, limit: 12 });
  let cargando = $state(true);
  let error = $state(null);

  const ordenes = {
    relevancia: { label: 'Relevancia' },
    precio_asc: { label: 'Precio: menor a mayor', sort: 'precio', order: 'asc' },
    precio_desc: { label: 'Precio: mayor a menor', sort: 'precio', order: 'desc' },
    nombre_asc: { label: 'Nombre A-Z', sort: 'nombre', order: 'asc' },
  };

  let orden = $state('relevancia');
  let categoriaActiva = $state('');
  let busquedaActiva = $state('');

  const cache = new Map();

  function cacheKey() {
    const q = new URLSearchParams();
    if (categoriaActiva) q.set('categoria', categoriaActiva);
    if (busquedaActiva) q.set('busqueda', busquedaActiva);
    if (ordenes[orden]?.sort) {
      q.set('sort', ordenes[orden].sort);
      q.set('order', ordenes[orden].order);
    }
    q.set('page', pagination.page);
    q.set('limit', pagination.limit);
    return q.toString();
  }

  function syncFromQuery() {
    categoriaActiva = query.categoria || '';
    busquedaActiva = query.busqueda || '';
  }

  async function cargar() {
    cargando = true;
    error = null;
    const key = cacheKey();
    if (cache.has(key)) {
      const cached = cache.get(key);
      productos = cached.data;
      pagination = cached.pagination;
      cargando = false;
      return;
    }
    const paramsReq = {
      page: pagination.page,
      limit: pagination.limit,
    };
    if (categoriaActiva) paramsReq.categoria = categoriaActiva;
    if (busquedaActiva) paramsReq.busqueda = busquedaActiva;
    if (ordenes[orden]?.sort) {
      paramsReq.sort = ordenes[orden].sort;
      paramsReq.order = ordenes[orden].order;
    }
    try {
      const data = await getProductos(paramsReq);
      cache.set(key, { data: data.data, pagination: data.pagination });
      productos = data.data;
      pagination = data.pagination;
    } catch (err) {
      error = err.message;
      productos = [];
      pagination = { page: 1, total: 0, totalPages: 1, limit: 12 };
    } finally {
      cargando = false;
    }
  }

  function cambiarPagina(p) {
    if (p < 1 || p > pagination.totalPages) return;
    pagination.page = p;
    cargar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function seleccionarCategoria(slug) {
    const nueva = categoriaActiva === slug ? '' : slug;
    categoriaActiva = nueva;
    pagination.page = 1;
    const q = new URLSearchParams();
    if (nueva) q.set('categoria', nueva);
    if (busquedaActiva) q.set('busqueda', busquedaActiva);
    navigate(`/catalogo${q.toString() ? `?${q}` : ''}`);
    cargar();
  }

  function cambiarOrden() {
    pagination.page = 1;
    cargar();
  }

  onMount(async () => {
    if (categorias.length === 0) await cargarCategorias();
    syncFromQuery();
    await cargar();
  });

  $effect(() => {
    syncFromQuery();
  });
</script>

<section class="container section">
  <div class="section-head">
    <div>
      <h2>Catálogo</h2>
      <p>
        {#if busquedaActiva}
          Resultados para “{busquedaActiva}”
        {:else}
          Equipamiento y accesorios para moto
        {/if}
      </p>
    </div>
  </div>

  <div class="catalog-layout">
    <aside class="catalog-side">
      <div class="filter-group">
        <h4>Categorías</h4>
        <div class="filter-list">
          <button
            class="filter-item"
            class:active={!categoriaActiva}
            onclick={() => seleccionarCategoria('')}
          >
            <span>Todas</span>
          </button>
          {#each categorias as cat (cat._id)}
            <button
              class="filter-item"
              class:active={categoriaActiva === cat.slug}
              onclick={() => seleccionarCategoria(cat.slug)}
            >
              <span>{cat.nombre}</span>
            </button>
          {/each}
        </div>
      </div>
    </aside>

    <div>
      <div class="catalog-toolbar">
        <span class="catalog-result">
          {cargando ? 'Cargando...' : `${pagination.total} producto${pagination.total === 1 ? '' : 's'}`}
        </span>
        <select class="select" bind:value={orden} onchange={cambiarOrden} aria-label="Ordenar por">
          {#each Object.entries(ordenes) as [key, val]}
            <option value={key}>{val.label}</option>
          {/each}
        </select>
      </div>

      {#if cargando}
        <div class="skeleton-grid">
          {#each Array(6) as _}
            <div class="skeleton-card">
              <div class="skeleton skeleton-media"></div>
              <div class="skeleton-line" style="margin:16px"></div>
              <div class="skeleton-line" style="margin:0 16px 24px;width:60%"></div>
            </div>
          {/each}
        </div>
      {:else if error}
        <div class="error-box">{error}</div>
      {:else if productos.length === 0}
        <div class="empty-state">
          <p>No encontramos productos con esos filtros.</p>
          <button
            class="btn btn-outline btn-sm"
            onclick={() => {
              categoriaActiva = '';
              busquedaActiva = '';
              navigate('/catalogo');
              cargar();
            }}
          >
            Limpiar filtros
          </button>
        </div>
      {:else}
        <div class="product-grid">
          {#each productos as producto (producto._id)}
            <ProductCard {producto} />
          {/each}
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
              <button
                class="page-btn"
                class:active={p === pagination.page}
                onclick={() => cambiarPagina(p)}
              >
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
    </div>
  </div>
</section>
