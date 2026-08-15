<script>
  import { formatCOP } from '../format.js';
  import { carrito, cambiarCantidad, totalCarrito, cantidadTotal } from '../store.js';
  import { showToast } from '../store.js';

  let { open, onClose = () => {} } = $props();

  function finalizar() {
    showToast('¡Gracias! Esto es una demo de la tienda.', 'success');
    onClose();
  }
</script>

{#if open}
  <div class="overlay" onclick={onClose} role="presentation" aria-hidden="true"></div>

  <div class="drawer" role="dialog" aria-modal="true" aria-label="Carrito de compras">
    <div class="drawer-head">
      <h3>Tu carrito {cantidadTotal ? `(${cantidadTotal})` : ''}</h3>
      <button class="icon-btn" title="Cerrar" onclick={onClose}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="drawer-body">
      {#if carrito.length === 0}
        <div class="cart-empty">
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5c5a66"
            stroke-width="1.5"
          >
            <path d="M6 6h15l-1.5 9h-12z" />
            <path d="M6 6L5 3H2" />
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
          </svg>
          <p>Tu carrito está vacío</p>
          <a class="btn btn-outline btn-sm" href="#/catalogo" onclick={onClose}>
            Explorar catálogo
          </a>
        </div>
      {:else}
        {#each carrito as item (item.producto._id)}
          <div class="cart-item">
            <div class="cart-thumb">
              {#if item.producto.imagenes && item.producto.imagenes.length}
                <img src={item.producto.imagenes[0]} alt="" />
              {:else}
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#5c5a66"
                  stroke-width="1.5"
                >
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M8 8h8M8 12h8M8 16h4" />
                </svg>
              {/if}
            </div>
            <div class="cart-item-info">
              <p class="titulo">{item.producto.nombre}</p>
              <p class="precio">
                {formatCOP(item.producto.precio)} c/u
              </p>
              <div class="cart-item-actions">
                <button
                  class="qty-btn"
                  onclick={() => cambiarCantidad(item.producto._id, -1)}
                  aria-label="Quitar uno"
                >
                  −
                </button>
                <span>{item.cantidad}</span>
                <button
                  class="qty-btn"
                  onclick={() => cambiarCantidad(item.producto._id, 1)}
                  aria-label="Agregar uno"
                >
                  +
                </button>
              </div>
            </div>
            <div class="cart-subtotal">
              <strong>{formatCOP(item.producto.precio * item.cantidad)}</strong>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    {#if carrito.length > 0}
      <div class="drawer-foot">
        <div class="resumen-row">
          <span>Subtotal</span>
          <span>{formatCOP(totalCarrito)}</span>
        </div>
        <div class="resumen-row total">
          <span>Total</span>
          <span>{formatCOP(totalCarrito)}</span>
        </div>
        <button class="btn btn-primary btn-block" onclick={finalizar}>
          Finalizar compra
        </button>
      </div>
    {/if}
  </div>
{/if}
