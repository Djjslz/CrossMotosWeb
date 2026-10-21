<script>
  import { onMount } from 'svelte';
  import { api } from '../../lib/api.js';
  import ProductCard from '../components/ProductCard.svelte';

  let {
    categoria = 'repuestos',
    kicker = 'Mantenimiento y rendimiento',
    titulo = 'Repuestos',
    tituloAcento = 'para motos',
    descripcion = '',
    nombrePlural = 'repuestos',
    nombreSingular = 'repuesto',
    buscarPlaceholder = 'Buscar por nombre o referencia...',
    ctaSecundarioTexto = '',
    ctaSecundarioEnlace = '',
    query = {},
  } = $props();

  let productos = $state([]);
  let tipos = $state([]);
  let pagination = $state({ page: 1, total: 0, totalPages: 1, limit: 12 });
  let cargando = $state(true);
  let error = $state('');
  let busquedaInput = $state('');
  let busquedaActiva = $state('');
  let tipoActivo = $state('');
  let orden = $state('relevancia');

  const ordenes = {
    relevancia: { label: 'Relevancia' },
    precio_asc: { label: 'Precio: menor a mayor', ordenar: 'precio' },
    precio_desc: { label: 'Precio: mayor a menor', ordenar: '-precio' },
    nombre_asc: { label: 'Nombre A-Z', ordenar: 'nombre' },
    nombre_desc: { label: 'Nombre Z-A', ordenar: '-nombre' },
  };

  function capitalizar(texto) {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .split(' ')
      .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : p))
      .join(' ');
  }

  function construirParams() {
    const q = new URLSearchParams({
      categoria,
      incluirSinPrecio: 'true',
      page: pagination.page,
      limit: pagination.limit,
    });
    if (tipoActivo) q.set('tipo', tipoActivo);
    if (busquedaActiva) q.set('busqueda', busquedaActiva);
    if (ordenes[orden]?.ordenar) q.set('ordenar', ordenes[orden].ordenar);
    return q;
  }

  async function cargar() {
    cargando = true;
    error = '';
    try {
      const data = await api.get(`/productos?${construirParams()}`);
      productos = data?.data ?? [];
      pagination = data?.pagination ?? pagination;
    } catch (err) {
      error = err.message;
      productos = [];
    } finally {
      cargando = false;
    }
  }

  async function cargarTipos() {
    try {
      const data = await api.get(`/productos/categorias/${categoria}/tipos`);
      tipos = data?.tipos ?? [];
    } catch {
      tipos = [];
    }
  }

  function seleccionarTipo(tipo) {
    tipoActivo = tipoActivo === tipo ? '' : tipo;
    pagination.page = 1;
    cargar();
  }

  function buscar(event) {
    event.preventDefault();
    busquedaActiva = busquedaInput.trim();
    pagination.page = 1;
    cargar();
  }

  function limpiarFiltros() {
    busquedaInput = '';
    busquedaActiva = '';
    tipoActivo = '';
    orden = 'relevancia';
    pagination.page = 1;
    cargar();
  }

  function cambiarOrden() {
    pagination.page = 1;
    cargar();
  }

  function cambiarPagina(p) {
    if (p < 1 || p > pagination.totalPages) return;
    pagination.page = p;
    cargar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onMount(() => {
    busquedaInput = query.busqueda ?? '';
    busquedaActiva = query.busqueda ?? '';
    tipoActivo = query.tipo ?? '';
    cargarTipos();
    cargar();
  });

  $effect(() => {
    if (query.busqueda !== undefined && query.busqueda !== busquedaActiva) {
      busquedaInput = query.busqueda ?? '';
      busquedaActiva = query.busqueda ?? '';
      pagination.page = 1;
      cargar();
    }
  });
</script>

<section class="container section">
  <div class="repuestos-hero">
    <div>
      <span class="hero-kicker">{kicker}</span>
      <h1>{titulo} <span class="grad">{tituloAcento}</span></h1>
      <p>{descripcion}</p>
      <div class="hero-cta">
        <a class="btn btn-primary" href="#/catalogo">Ver todo el catálogo</a>
        {#if ctaSecundarioTexto && ctaSecundarioEnlace}
          <a class="btn btn-outline" href={ctaSecundarioEnlace}>{ctaSecundarioTexto}</a>
        {/if}
      </div>
    </div>
    <div class="repuestos-hero-panel">
      <div class="repuestos-stat">
        <strong>{pagination.total}</strong>
        <span>{nombrePlural} en el catálogo</span>
      </div>
      <div class="repuestos-stat">
        <strong>{tipos.length}</strong>
        <span>tipos de {nombreSingular}</span>
      </div>
    </div>
  </div>
</section>

<section class="container section">
  <div class="section-head">
    <div>
      <h2>Explora los {nombrePlural}</h2>
      <p>Filtra por tipo o busca por nombre, referencia o marca.</p>
    </div>
  </div>

  <div class="cat-nav" aria-label={`Tipos de ${nombreSingular}`}>
    <button class="cat-chip" class:active={!tipoActivo} onclick={() => seleccionarTipo('')}>
      Todos
    </button>
    {#each tipos as tipo (tipo.nombre)}
      <button
        class="cat-chip"
        class:active={tipoActivo === tipo.nombre}
        onclick={() => seleccionarTipo(tipo.nombre)}
      >
        {capitalizar(tipo.nombre)}
        <span class="chip-count">{tipo.total}</span>
      </button>
    {/each}
  </div>

  <div class="catalog-toolbar">
    <form class="nav-search" style="max-width:100%;flex:1" onsubmit={buscar}>
      <svg class="search-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        type="text"
        bind:value={busquedaInput}
        placeholder={buscarPlaceholder}
        aria-label={`Buscar ${nombreSingular}`}
      />
    </form>
    <span class="catalog-result">
      {cargando ? 'Cargando...' : `${pagination.total} ${pagination.total === 1 ? nombreSingular : nombrePlural}`}
    </span>
    <select class="select" bind:value={orden} onchange={cambiarOrden} aria-label="Ordenar por">
      {#each Object.entries(ordenes) as [key, val]}
        <option value={key}>{val.label}</option>
      {/each}
    </select>
  </div>

  {#if error}
    <div class="error-box">
      <span>{error}</span>
      <button class="btn btn-outline btn-sm" onclick={cargar}>Reintentar</button>
    </div>
  {:else if cargando}
    <div class="skeleton-grid">
      {#each Array(12) as _}
        <div class="skeleton-card">
          <div class="skeleton skeleton-media"></div>
          <div class="skeleton-line" style="margin:16px"></div>
          <div class="skeleton-line" style="margin:0 16px 24px;width:60%"></div>
        </div>
      {/each}
    </div>
  {:else if productos.length === 0}
    <div class="empty-state">
      <p>No encontramos {nombrePlural} con esos filtros.</p>
      <button class="btn btn-outline btn-sm" onclick={limpiarFiltros}>Limpiar filtros</button>
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
