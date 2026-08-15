<script>
  import { onMount } from 'svelte';
  import { parseHash } from './lib/router.js';
  import { cargarCategorias, toast } from './lib/store.svelte.js';
  import { estaAutenticado } from './lib/api.js';
  import Navbar from './lib/components/Navbar.svelte';
  import Footer from './lib/components/Footer.svelte';
  import CartDrawer from './lib/components/CartDrawer.svelte';
  import Home from './lib/views/Home.svelte';
  import Catalog from './lib/views/Catalog.svelte';
  import ProductDetail from './lib/views/ProductDetail.svelte';
  import AdminLogin from './lib/views/AdminLogin.svelte';
  import AdminPanel from './lib/views/AdminPanel.svelte';

  let route = $state({ path: '/', query: {} });
  let cartOpen = $state(false);
  let sesionRevision = $state(0);

  function actualizarRuta() {
    route = parseHash();
  }

  onMount(() => {
    actualizarRuta();
    window.addEventListener('hashchange', actualizarRuta);
    cargarCategorias();
  });
</script>

<Navbar onOpenCart={() => (cartOpen = true)} />

<main>
  {#if route.path === '/'}
    <Home />
  {:else if route.path === '/catalogo'}
    <Catalog query={route.query} />
  {:else if route.path.startsWith('/producto/')}
    <ProductDetail slug={route.path.split('/')[2]} />
  {:else if route.path === '/admin'}
    {#if estaAutenticado()}
      <AdminPanel onLogout={() => (sesionRevision += 1)} />
    {:else}
      <AdminLogin onLogin={() => (sesionRevision += 1)} />
    {/if}
  {:else}
    <section class="container section">
      <div class="empty-state">
        <p>Página no encontrada</p>
        <a class="btn btn-primary" href="#/">Volver al inicio</a>
      </div>
    </section>
  {/if}
</main>

<Footer />

<CartDrawer open={cartOpen} onClose={() => (cartOpen = false)} />

{#if toast.mensaje}
  <div class="toast {toast.tipo}">
    {#if toast.tipo === 'success'}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    {:else}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    {/if}
    {toast.mensaje}
  </div>
{/if}
