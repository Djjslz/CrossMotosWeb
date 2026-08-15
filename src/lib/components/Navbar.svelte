<script>
  import { navigate } from '../router.js';
  import { getCantidadTotal } from '../store.svelte.js';

  let { onOpenCart = () => {} } = $props();

  let query = $state('');
  let cantidadTotal = $derived(getCantidadTotal());

  function doSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/catalogo?busqueda=${encodeURIComponent(q)}` : '/catalogo');
  }
</script>

<nav class="navbar">
  <div class="container navbar-inner">
    <a href="#/" class="brand" onclick={() => navigate('/')}>
      <span class="brand-mark">CM</span>
      <span class="brand-text">CrossMotos</span>
    </a>

    <form class="nav-search" onsubmit={doSearch}>
      <svg
        class="search-ico"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        type="text"
        placeholder="Buscar cascos, guantes, accesorios..."
        aria-label="Buscar productos"
        bind:value={query}
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            doSearch();
          }
        }}
      />
    </form>

    <div class="nav-actions">
      <a href="#/admin" class="icon-btn" title="Panel de administración">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </a>
      <a href="#/catalogo" class="icon-btn" title="Catálogo">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </a>
      <button class="icon-btn" title="Carrito" onclick={onOpenCart}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M6 6h15l-1.5 9h-12z" />
          <path d="M6 6L5 3H2" />
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
        </svg>
        {#if cantidadTotal > 0}
          <span class="badge">{cantidadTotal}</span>
        {/if}
      </button>
    </div>
  </div>
</nav>
