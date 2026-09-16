<script>
  import { api, getImageUrl } from '../api.js';
  import { formatCOP } from '../format.js';

  let { onSearch = () => {} } = $props();

  let query = $state('');
  let sugerencias = $state([]);
  let cargando = $state(false);
  let abierto = $state(false);
  let debounceTimer = null;
  let inputEl = $state(null);
  let contenedorEl = $state(null);

  function cerrar() {
    abierto = false;
    sugerencias = [];
  }

  function buscar() {
    const term = query.trim();
    if (term.length < 2) {
      cerrar();
      return;
    }
    cargando = true;
    api.getSugerencias(term).then((data) => {
      sugerencias = data ?? [];
      abierto = true;
      cargando = false;
    }).catch(() => {
      sugerencias = [];
      abierto = false;
      cargando = false;
    });
  }

  function onInput(e) {
    query = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(buscar, 300);
  }

  function seleccionar(sug) {
    query = '';
    cerrar();
    onSearch(sug.nombre);
  }

  function enviarBusqueda(e) {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    cerrar();
    onSearch(term);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      cerrar();
      inputEl?.blur();
    }
  }

  function onClickExterior(e) {
    if (contenedorEl && !contenedorEl.contains(e.target)) {
      cerrar();
    }
  }

  $effect(() => {
    document.addEventListener('click', onClickExterior);
    return () => document.removeEventListener('click', onClickExterior);
  });
</script>

<div class="search-autocomplete" bind:this={contenedorEl}>
  <form class="nav-search" onsubmit={enviarBusqueda}>
    <svg class="search-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
    <input
      bind:this={inputEl}
      type="text"
      placeholder="Buscar productos..."
      value={query}
      oninput={onInput}
      onkeydown={onKeyDown}
      autocomplete="off"
    />
    {#if cargando}
      <span class="search-spinner"></span>
    {/if}
  </form>

  {#if abierto && (sugerencias.length > 0 || query.trim().length >= 2)}
    <div class="ac-dropdown">
      {#if sugerencias.length > 0}
        {#each sugerencias as sug}
          <a
            href="#/catalogo?busqueda={encodeURIComponent(sug.nombre)}"
            class="ac-item"
            onclick={() => seleccionar(sug)}
          >
            <div class="ac-img">
              {#if sug.imagen}
                <img src={getImageUrl(sug.imagen)} alt={sug.nombre} loading="lazy" />
              {:else}
                <span class="ac-img-placeholder">📦</span>
              {/if}
            </div>
            <div class="ac-info">
              <span class="ac-nombre">{sug.nombre}</span>
              {#if sug.marca}
                <span class="ac-marca">{sug.marca}</span>
              {/if}
            </div>
            <span class="ac-precio">{formatCOP(sug.precio)}</span>
          </a>
        {/each}
        <a
          href="#/catalogo?busqueda={encodeURIComponent(query.trim())}"
          class="ac-ver-todos"
          onclick={cerrar}
        >
          Ver todos los resultados para "{query.trim()}"
        </a>
      {:else}
        <div class="ac-vacio">No se encontraron productos</div>
      {/if}
    </div>
  {/if}
</div>