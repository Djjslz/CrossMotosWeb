<script>
  import { onMount } from 'svelte';
  import { getProducto, navigate } from '../../lib/router.js';
  import { formatCOP } from '../../lib/format.js';
  import { agregarAlCarrito } from '../../lib/store.js';
  import ProductCard from '../components/ProductCard.svelte';

  let { slug } = $props();

  let producto = $state(null);
  let cargando = $state(true);
  let error = $state(null);
  let cantidad = $state(1);

  function stockClass(stock) {
    if (!stock || stock <= 0) return 'agotado';
    if (stock <= 5) return 'bajo';
    return 'ok';
  }

  function stockText(stock) {
    if (!stock || stock <= 0) return 'Agotado';
    if (stock <= 5) return `¡Solo quedan ${stock}!`;
    return `${stock} disponibles`;
  }

  async function cargar() {
    cargando = true;
    error = null;
    try {
      producto = await getProducto(slug);
      cantidad = 1;
    } catch (err) {
      error = err.message;
    } finally {
      cargando = false;
    }
  }

  onMount(cargar);

  $effect(() => {
    if (producto && producto.slug !== slug) cargar();
  });
</script>

<section class="container section">
  {#if cargando}
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando producto...</p>
    </div>
  {:else if error}
    <div class="error-box">{error}</div>
  {:else if producto}
    <a
      class="btn btn-outline btn-sm"
      style="margin-bottom:24px"
      href="#/catalogo"
    >
      ← Volver al catálogo
    </a>

    <div class="detail-layout">
      <div class="detail-media">
        {#if producto.imagenes && producto.imagenes.length}
          <img src={producto.imagenes[0]} alt={producto.nombre} />
        {:else}
          <svg
            width="140"
            height="140"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5c5a66"
            stroke-width="1"
          >
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h4" />
          </svg>
        {/if}
      </div>

      <div class="detail-info">
        {#if producto.marca}
          <span class="detail-marca">{producto.marca}</span>
        {/if}
        <h1 class="detail-title">{producto.nombre}</h1>
        <div class="detail-precio">{formatCOP(producto.precio)}</div>
        <div>
          <span class="stock-chip {stockClass(producto.stock)}">
            <span class="dot"></span>
            {stockText(producto.stock)}
          </span>
        </div>

        {#if producto.descripcion}
          <p class="detail-desc">{producto.descripcion}</p>
        {/if}

        {#if producto.sku}
          <p class="detail-sku">SKU: {producto.sku}</p>
        {/if}

        <div class="detail-actions">
          <div class="cantidad-control">
            <button
              disabled={cantidad <= 1}
              onclick={() => (cantidad -= 1)}
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span>{cantidad}</span>
            <button
              disabled={cantidad >= (producto.stock || 0)}
              onclick={() => (cantidad += 1)}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
          <button
            class="btn btn-primary"
            disabled={!producto.stock || producto.stock <= 0}
            onclick={() => agregarAlCarrito(producto, cantidad)}
            style="flex:1"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>

    {#if producto.productosRelacionados && producto.productosRelacionados.length}
      <div class="section">
        <div class="section-head">
          <div>
            <h2>También te puede interesar</h2>
            <p>Productos relacionados con tu búsqueda.</p>
          </div>
        </div>
        <div class="product-grid">
          {#each producto.productosRelacionados.slice(0, 4) as rel (rel._id)}
            <ProductCard producto={rel} />
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</section>
