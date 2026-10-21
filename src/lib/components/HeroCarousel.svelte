<script>
  import { onMount, onDestroy } from 'svelte';
  import { api, getImageUrl } from '../api.js';

  const FALLBACK = [
    {
      titulo: 'Equipamiento y repuestos para tu moto',
      subtitulo: 'CrossMotos',
      descripcion: 'Cascos, accesorios y repuestos de las mejores marcas para cada kilómetro.',
      textoBoton: 'Ver catálogo',
      enlace: '#/catalogo',
      imagen: '',
    },
  ];

  let slides = $state([]);
  let indice = $state(0);
  let cargando = $state(true);
  let pausado = $state(false);
  let timer = null;

  function detener() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function iniciar() {
    detener();
    if (slides.length <= 1) return;
    timer = setInterval(() => {
      if (!pausado) indice = (indice + 1) % slides.length;
    }, 6000);
  }

  function ir(i) {
    if (!slides.length) return;
    indice = (i + slides.length) % slides.length;
    iniciar();
  }

  onMount(async () => {
    try {
      const data = await api.get('/slides');
      slides = Array.isArray(data) ? data : [];
    } catch {
      slides = [];
    }
    if (!slides.length) slides = FALLBACK;
    cargando = false;
    iniciar();
  });

  onDestroy(detener);
</script>

<section class="container section carousel-wrap">
  <div
    class="hero-carousel"
    role="region"
    aria-label="Contenido destacado de portada"
    onmouseenter={() => (pausado = true)}
    onmouseleave={() => (pausado = false)}
  >
    {#if cargando}
      <div class="carousel-loading">
        <div class="spinner"></div>
      </div>
    {:else}
      {#each slides as slide, i (slide._id ?? i)}
        <div class="carousel-slide" class:active={i === indice} aria-hidden={i !== indice}>
          {#if slide.imagen}
            <img class="carousel-bg" src={getImageUrl(slide.imagen)} alt={slide.titulo} />
          {:else}
            <div class="carousel-bg carousel-bg-fallback"></div>
          {/if}
          <div class="carousel-shade"></div>

          <div class="carousel-content">
            {#if slide.subtitulo}
              <span class="hero-kicker">{slide.subtitulo}</span>
            {/if}
            <h1>{slide.titulo}</h1>
            {#if slide.descripcion}
              <p>{slide.descripcion}</p>
            {/if}
            {#if slide.enlace}
              <a
                class="btn btn-primary"
                href={slide.enlace}
                tabindex={i === indice ? 0 : -1}
              >
                {slide.textoBoton || 'Ver más'}
              </a>
            {/if}
          </div>
        </div>
      {/each}

      {#if slides.length > 1}
        <button class="carousel-arrow prev" onclick={() => ir(indice - 1)} aria-label="Anterior">
          ‹
        </button>
        <button class="carousel-arrow next" onclick={() => ir(indice + 1)} aria-label="Siguiente">
          ›
        </button>

        <div class="carousel-dots">
          {#each slides as slide, i (slide._id ?? i)}
            <button
              class="carousel-dot"
              class:active={i === indice}
              onclick={() => ir(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
            ></button>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</section>
