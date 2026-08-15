<script>
  import { navigate } from '../router.js';
  import { formatCOP } from '../format.js';
  import { agregarAlCarrito } from '../store.js';

  let { producto } = $props();

  function stockClass(stock) {
    if (!stock || stock <= 0) return 'agotado';
    if (stock <= 5) return 'bajo';
    return 'ok';
  }

  function stockText(stock) {
    if (!stock || stock <= 0) return 'Sin stock';
    if (stock <= 5) return `Quedan ${stock}`;
    return 'Disponible';
  }

  function irDetalle() {
    navigate(`/producto/${producto.slug}`);
  }
</script>

<article class="product-card">
  <div
    class="card-media"
    onclick={irDetalle}
    onkeydown={(e) => {
      if (e.key === 'Enter') irDetalle();
    }}
    role="link"
    tabindex="0"
  >
    {#if producto.imagenes && producto.imagenes.length}
      <img src={producto.imagenes[0]} alt={producto.nombre} loading="lazy" />
    {:else}
      <svg
        width="60"
        height="60"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#5c5a66"
        stroke-width="1.5"
      >
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h4" />
      </svg>
    {/if}

    <div class="card-badges">
      {#if producto.destacado}
        <span class="badge badge-destacado">Destacado</span>
      {/if}
      {#if !producto.stock || producto.stock <= 0}
        <span class="badge badge-sin-stock">Agotado</span>
      {/if}
    </div>
  </div>

  <div class="card-body">
    {#if producto.marca}
      <span class="card-marca">{producto.marca}</span>
    {/if}
    <h3 class="card-titulo">{producto.nombre}</h3>
    <div class="card-precio">
      <small>COP</small>
      {formatCOP(producto.precio)}
    </div>
    <div class="card-footer">
      <button
        class="btn-carrito"
        disabled={!producto.stock || producto.stock <= 0}
        onclick={() => agregarAlCarrito(producto)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M6 6h15l-1.5 9h-12z" />
          <path d="M6 6L5 3H2" />
        </svg>
        Agregar
      </button>
      <span class="stock-note {stockClass(producto.stock)}">{stockText(producto.stock)}</span>
    </div>
  </div>
</article>
