<script>
  import { onMount } from 'svelte';
  import { api, getImageUrl } from '../../lib/api.js';
  import { showToast } from '../store.svelte.js';
  import SlideForm from './SlideForm.svelte';

  let slides = $state([]);
  let cargando = $state(true);
  let error = $state('');
  let formAbierto = $state(false);
  let slideEdicion = $state(null);
  let procesando = $state('');

  async function cargar() {
    cargando = true;
    error = '';
    try {
      const data = await api.get('/slides/todas');
      slides = data?.data ?? [];
    } catch (err) {
      error = err.message;
    } finally {
      cargando = false;
    }
  }

  function abrirFormulario(slide = null) {
    slideEdicion = slide;
    formAbierto = true;
  }

  async function alGuardar() {
    formAbierto = false;
    slideEdicion = null;
    await cargar();
  }

  async function alternarActivo(slide) {
    procesando = slide._id;
    try {
      const data = await api.put(`/slides/${slide._id}`, { activo: !slide.activo });
      slide.activo = data.activo;
      showToast(data.activo ? 'Diapositiva visible en la portada' : 'Diapositiva ocultada');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      procesando = '';
    }
  }

  async function eliminar(slide) {
    if (!confirm(`¿Eliminar la diapositiva "${slide.titulo}"?`)) return;
    procesando = slide._id;
    try {
      await api.del(`/slides/${slide._id}`);
      slides = slides.filter((s) => s._id !== slide._id);
      showToast('Diapositiva eliminada');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      procesando = '';
    }
  }

  onMount(cargar);
</script>

<div class="admin-toolbar">
  <div>
    <h3>Carrusel de portada</h3>
    <p class="meta">Administra las diapositivas que se muestran al inicio. Si no hay ninguna activa, se usa el carrusel por defecto.</p>
  </div>
  <button class="btn btn-primary btn-sm" onclick={() => abrirFormulario()}>+ Nueva diapositiva</button>
</div>

{#if error}
  <div class="error-box">
    <span>{error}</span>
    <button class="btn btn-outline btn-sm" onclick={cargar}>Reintentar</button>
  </div>
{/if}

{#if cargando}
  <div class="loading"><div class="spinner"></div><p>Cargando diapositivas...</p></div>
{:else if slides.length === 0}
  <div class="empty-state">
    <p>Aún no hay diapositivas. Crea la primera para personalizar la portada.</p>
    <button class="btn btn-primary btn-sm" onclick={() => abrirFormulario()}>Crear diapositiva</button>
  </div>
{:else}
  <div class="portada-grid">
    {#each slides as slide (slide._id)}
      <article class="portada-card" class:inactiva={!slide.activo}>
        <div class="portada-thumb">
          {#if slide.imagen}
            <img src={getImageUrl(slide.imagen)} alt={slide.titulo} />
          {:else}
            <div class="portada-thumb-fallback">{slide.titulo.charAt(0)}</div>
          {/if}
          <span class="badge" class:badge-ok={slide.activo} class:badge-bajo={!slide.activo}>
            {slide.activo ? 'Visible' : 'Oculta'}
          </span>
          <span class="portada-orden">#{slide.orden}</span>
        </div>

        <div class="portada-body">
          <h4>{slide.titulo}</h4>
          {#if slide.subtitulo}
            <p class="portada-sub">{slide.subtitulo}</p>
          {/if}
          {#if slide.enlace}
            <p class="meta">{slide.textoBoton || 'Ver más'} → {slide.enlace}</p>
          {/if}
        </div>

        <div class="portada-actions">
          <button class="mini-btn" onclick={() => abrirFormulario(slide)}>Editar</button>
          <button class="mini-btn" disabled={procesando === slide._id} onclick={() => alternarActivo(slide)}>
            {slide.activo ? 'Ocultar' : 'Mostrar'}
          </button>
          <button class="mini-btn danger" disabled={procesando === slide._id} onclick={() => eliminar(slide)}>
            Eliminar
          </button>
        </div>
      </article>
    {/each}
  </div>
{/if}

{#if formAbierto}
  <SlideForm
    slide={slideEdicion}
    onCerrar={() => {
      formAbierto = false;
      slideEdicion = null;
    }}
    onGuardado={alGuardar}
  />
{/if}
