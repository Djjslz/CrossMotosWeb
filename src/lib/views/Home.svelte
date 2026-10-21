<script>
  import { onMount } from 'svelte';
  import { destacados, cargarDestacados } from '../store.svelte.js';
  import ProductCard from '../components/ProductCard.svelte';
  import HeroCarousel from '../components/HeroCarousel.svelte';

  let cargando = $state(true);

  onMount(async () => {
    await cargarDestacados();
    cargando = false;
  });
</script>

<HeroCarousel />

<section class="container section">
  <div class="section-head">
    <div>
      <h2>Compra por sección</h2>
      <p>Accesorios y repuestos para tu moto, organizados para encontrarlos rápido.</p>
    </div>
  </div>

  <div class="secciones-grid">
    <a class="seccion-card seccion-accesorios" href="#/accesorios">
      <span class="seccion-kicker">Estilo y equipamiento</span>
      <h3>Accesorios</h3>
      <p>Portaplacas, espejos, sliders, tapas, soportes y más para personalizar tu moto.</p>
      <span class="seccion-cta">Ver accesorios →</span>
    </a>

    <a class="seccion-card seccion-repuestos" href="#/repuestos">
      <span class="seccion-kicker">Mantenimiento</span>
      <h3>Repuestos</h3>
      <p>Bombas, filtros, calapies, maniguetas, cupulas y componentes de recambio.</p>
      <span class="seccion-cta">Ver repuestos →</span>
    </a>
  </div>
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
  {:else if destacados.length === 0}
    <div class="empty-state">
      <p>No hay productos destacados aún.</p>
      <a class="btn btn-outline btn-sm" href="#/catalogo">Ir al catálogo</a>
    </div>
  {:else}
    <div class="product-grid">
      {#each destacados as producto (producto._id)}
        <ProductCard {producto} />
      {/each}
    </div>
  {/if}
</section>
