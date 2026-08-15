<script>
  import { onMount } from 'svelte';
  import { navigate, getDestacados } from '../../lib/router.js';
  import { categorias, cargarCategorias } from '../../lib/store.js';
  import ProductCard from '../components/ProductCard.svelte';
  import CategoryNav from '../components/CategoryNav.svelte';

  let destacados = $state([]);
  let cargando = $state(true);
  let error = $state(null);

  onMount(async () => {
    if (categorias.length === 0) await cargarCategorias();
    try {
      destacados = await getDestacados();
    } catch (err) {
      error = err.message;
    } finally {
      cargando = false;
    }
  });
</script>

<section class="container section">
  <div class="hero">
    <div>
      <span class="hero-kicker">Equipamiento para motociclistas</span>
      <h1>
        Rueda seguro, <br />
        <span class="grad">rueda con estilo</span>
      </h1>
      <p>
        Cascos, guantes, chaquetas y accesorios de las mejores marcas para
        protegerte en cada kilómetro.
      </p>
      <div class="hero-cta">
        <button class="btn btn-primary" onclick={() => navigate('/catalogo')}>
          Ver catálogo
        </button>
        <button class="btn btn-outline" onclick={() => navigate('/catalogo?categoria=cascos')}>
          Cascos
        </button>
      </div>
    </div>
    <div class="hero-visual">
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="150" r="130" fill="rgba(255,77,0,0.08)" />
        <circle cx="200" cy="150" r="100" fill="rgba(255,77,0,0.06)" stroke="rgba(255,77,0,0.35)" stroke-width="2" stroke-dasharray="6 6" />
        <path
          d="M200 60c-40 0-70 30-70 70v20l-20 40c-4 8 2 18 11 18h158c9 0 15-10 11-18l-20-40v-20c0-40-30-70-70-70z"
          fill="#1f1f26"
          stroke="url(#g)"
          stroke-width="3"
        />
        <path d="M155 180h90l-8-45h-74z" fill="#0a0a0c" stroke="#35353f" stroke-width="2" />
        <rect x="150" y="200" width="100" height="14" rx="7" fill="#ff4d00" />
        <rect x="120" y="230" width="160" height="10" rx="5" fill="rgba(255,77,0,0.5)" />
        <path d="M210 55l14-14M230 55l6-18" stroke="#35353f" stroke-width="2" stroke-linecap="round" />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ff4d00" />
            <stop offset="100%" stop-color="#ff6a2b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
</section>

<section class="container section">
  <div class="section-head">
    <div>
      <h2>Explora por categoría</h2>
      <p>Encuentra todo lo que necesitas para tu moto y tu seguridad.</p>
    </div>
  </div>
  <CategoryNav />
</section>

<section class="container section">
  <div class="section-head">
    <div>
      <h2>Productos destacados</h2>
      <p>Lo más buscado por nuestra comunidad de motociclistas.</p>
    </div>
    <a class="btn btn-outline btn-sm" href="#/catalogo">Ver todos</a>
  </div>

  {#if cargando}
    <div class="skeleton-grid">
      {#each Array(8) as _}
        <div class="skeleton-card">
          <div class="skeleton skeleton-media"></div>
          <div class="skeleton-line" style="margin:16px"></div>
          <div class="skeleton-line" style="margin:0 16px 24px;width:60%"></div>
        </div>
      {/each}
    </div>
  {:else if error}
    <div class="error-box">{error}</div>
  {:else if destacados.length === 0}
    <div class="empty-state">
      <p>No hay productos destacados aún.</p>
      <a class="btn btn-outline btn-sm" href="#/catalogo">Ir al catálogo</a>
    </div>
  {:else}
    <div class="product-grid">
      {#each destacados.slice(0, 8) as producto (producto._id)}
        <ProductCard {producto} />
      {/each}
    </div>
  {/if}
</section>
