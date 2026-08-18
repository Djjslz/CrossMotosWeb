<script>
  import { formatCOP } from '../format.js';
  import { api } from '../api.js';
  import {
    carrito,
    cambiarCantidad,
    getTotalCarrito,
    getCantidadTotal,
    showToast,
  } from '../store.svelte.js';
  import {
    WHATSAPP_NUMBER,
    construirPayloadPedido,
    construirMensajeWhatsApp,
    abrirWhatsApp,
  } from '../checkout.js';

  let { open, onClose = () => {} } = $props();

  let totalCarrito = $derived(getTotalCarrito());
  let cantidadTotal = $derived(getCantidadTotal());

  let pantalla = $state('carrito');
  let enviando = $state(false);
  let ultimoPedido = $state(null);

  let cliente = $state({
    nombre: '',
    telefono: '',
    email: '',
    ciudad: '',
    direccion: '',
    notas: '',
  });
  let tipoEntrega = $state('recojo_en_tienda');

  function abrirCheckout() {
    if (carrito.length === 0) return;
    pantalla = 'checkout';
  }

  function volverAlCarrito() {
    pantalla = 'carrito';
  }

  function cerrar() {
    pantalla = 'carrito';
    onClose();
  }

  async function enviarCotizacion(medioContacto) {
    if (!cliente.nombre.trim() || !cliente.telefono.trim()) {
      showToast('Completa tu nombre y teléfono', 'error');
      return;
    }
    enviando = true;
    try {
      const pedido = await api.post(
        '/pedidos',
        construirPayloadPedido(carrito, cliente, tipoEntrega, medioContacto)
      );
      ultimoPedido = pedido;
      carrito.length = 0;
      pantalla = 'confirmacion';
      if (medioContacto === 'whatsapp') {
        abrirWhatsApp(construirMensajeWhatsApp(pedido.items, cliente, tipoEntrega, pedido.numero));
      }
      showToast(`Cotización ${pedido.numero} enviada`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      enviando = false;
    }
  }

  function abrirWhatsAppManual() {
    if (!ultimoPedido) return;
    abrirWhatsApp(
      construirMensajeWhatsApp(ultimoPedido.items, cliente, tipoEntrega, ultimoPedido.numero)
    );
  }
</script>

{#if open}
  <div class="overlay" onclick={cerrar} role="presentation" aria-hidden="true"></div>

  <div class="drawer" role="dialog" aria-modal="true" aria-label="Carrito de compras">
    <div class="drawer-head">
      <h3>
        {#if pantalla === 'checkout'}
          Datos de contacto
        {:else if pantalla === 'confirmacion'}
          Cotización enviada
        {:else}
          Tu carrito {cantidadTotal ? `(${cantidadTotal})` : ''}
        {/if}
      </h3>
      <button class="icon-btn" title="Cerrar" onclick={cerrar}>
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
      {#if pantalla === 'checkout'}
        <p class="checkout-info">
          Déjanos tus datos y envía tu cotización. Te contactaremos para confirmar precios y
          disponibilidad (sin pago en línea).
        </p>
        <div class="checkout-form">
          <label class="field">
            <span>Nombre *</span>
            <input type="text" bind:value={cliente.nombre} placeholder="Tu nombre" />
          </label>
          <label class="field">
            <span>Teléfono *</span>
            <input type="tel" bind:value={cliente.telefono} placeholder="300 123 4567" />
          </label>
          <div class="checkout-row">
            <label class="field">
              <span>Email</span>
              <input type="email" bind:value={cliente.email} placeholder="correo@ejemplo.com" />
            </label>
            <label class="field">
              <span>Ciudad</span>
              <input type="text" bind:value={cliente.ciudad} placeholder="Medellín" />
            </label>
          </div>
          <label class="field">
            <span>Dirección</span>
            <input type="text" bind:value={cliente.direccion} placeholder="Solo si es envío" />
          </label>
          <label class="field">
            <span>Entrega</span>
            <select class="select" bind:value={tipoEntrega}>
              <option value="recojo_en_tienda">Recojo en tienda</option>
              <option value="envio">Envío</option>
            </select>
          </label>
          <label class="field">
            <span>Notas</span>
            <textarea
              bind:value={cliente.notas}
              placeholder="Color, talla, observaciones..."
            ></textarea>
          </label>
        </div>
      {:else if pantalla === 'confirmacion'}
        <div class="confirm-box">
          <div class="confirm-ico">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h3>¡Cotización {ultimoPedido?.numero} creada!</h3>
          <p class="checkout-info">
            Total: <strong>{formatCOP(ultimoPedido?.total || 0)}</strong>. Nuestro equipo te
            contactará para confirmar disponibilidad y el paso a seguir.
          </p>
          <div class="checkout-actions">
            {#if WHATSAPP_NUMBER}
              <button class="btn btn-primary btn-block" onclick={abrirWhatsAppManual}>
                Enviar por WhatsApp
              </button>
            {/if}
            <a class="btn btn-outline btn-block" href="#/catalogo" onclick={cerrar}>
              Seguir explorando
            </a>
          </div>
        </div>
      {:else}
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
            <a class="btn btn-outline btn-sm" href="#/catalogo" onclick={cerrar}>
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
                <p class="precio">{formatCOP(item.producto.precio)} c/u</p>
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
      {/if}
    </div>

    {#if pantalla === 'checkout'}
      <div class="drawer-foot">
        <div class="checkout-actions">
          <button
            class="btn btn-primary btn-block"
            disabled={enviando}
            onclick={() => enviarCotizacion('formulario')}
          >
            {enviando ? 'Enviando...' : 'Enviar cotización'}
          </button>
          {#if WHATSAPP_NUMBER}
            <button
              class="btn btn-outline btn-block"
              disabled={enviando}
              onclick={() => enviarCotizacion('whatsapp')}
            >
              Enviar por WhatsApp
            </button>
          {/if}
        </div>
        <button class="link-btn" onclick={volverAlCarrito}>← Volver al carrito</button>
      </div>
    {:else if pantalla === 'carrito' && carrito.length > 0}
      <div class="drawer-foot">
        <div class="resumen-row">
          <span>Subtotal</span>
          <span>{formatCOP(totalCarrito)}</span>
        </div>
        <div class="resumen-row total">
          <span>Total</span>
          <span>{formatCOP(totalCarrito)}</span>
        </div>
        <button class="btn btn-primary btn-block" onclick={abrirCheckout}>
          Finalizar compra
        </button>
      </div>
    {/if}
  </div>
{/if}