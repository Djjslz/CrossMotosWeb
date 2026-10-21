<script>
  import { api, getImageUrl } from '../../lib/api.js';
  import { showToast } from '../store.svelte.js';

  let { slide, onCerrar, onGuardado } = $props();

  const esEdicion = !!slide;
  let titulo = $state(slide?.titulo ?? '');
  let subtitulo = $state(slide?.subtitulo ?? '');
  let descripcion = $state(slide?.descripcion ?? '');
  let imagen = $state(slide?.imagen ?? '');
  let textoBoton = $state(slide?.textoBoton ?? 'Ver catálogo');
  let enlace = $state(slide?.enlace ?? '#/catalogo');
  let orden = $state(slide?.orden ?? 0);
  let activo = $state(slide?.activo ?? true);
  let nuevaURL = $state('');
  let guardando = $state(false);
  let subiendo = $state(false);
  let error = $state('');

  function normalizarUrl(valor) {
    let str = typeof valor === 'object' && valor?.url ? valor.url : valor;
    if (typeof str !== 'string') return '';
    str = str.replace(/\\/g, '/').trim();
    if (!str) return '';
    if (!str.startsWith('http') && !str.startsWith('data:') && !str.startsWith('/api/')) {
      return str.startsWith('/') ? `/api${str}` : `/api/${str}`;
    }
    return str;
  }

  async function subirArchivo(event) {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    subiendo = true;
    error = '';
    try {
      const fd = new FormData();
      fd.append('imagenes', archivo);
      const data = await api.upload('/uploads', fd);
      const urls = Array.isArray(data) ? data : data?.urls ?? (data?.url ? [data.url] : []);
      imagen = normalizarUrl(urls[0]);
      showToast('Imagen subida');
    } catch (err) {
      error = err.message;
    } finally {
      subiendo = false;
      event.target.value = '';
    }
  }

  function usarURL() {
    const url = normalizarUrl(nuevaURL);
    if (!url) return;
    imagen = url;
    nuevaURL = '';
  }

  async function guardar() {
    if (!titulo.trim()) {
      error = 'El título es requerido';
      return;
    }
    const payload = {
      titulo: titulo.trim(),
      subtitulo: subtitulo.trim(),
      descripcion: descripcion.trim(),
      imagen,
      textoBoton: textoBoton.trim() || 'Ver más',
      enlace: enlace.trim(),
      orden: Number(orden) || 0,
      activo,
    };
    guardando = true;
    error = '';
    try {
      if (esEdicion) {
        await api.put(`/slides/${slide._id}`, payload);
        showToast('Diapositiva actualizada');
      } else {
        await api.post('/slides', payload);
        showToast('Diapositiva creada');
      }
      onGuardado?.();
    } catch (err) {
      error = err.message;
    } finally {
      guardando = false;
    }
  }
</script>

<div class="overlay" role="presentation" onclick={onCerrar}></div>
<div class="modal" role="dialog" aria-modal="true">
  <div class="modal-head">
    <h3>{esEdicion ? 'Editar diapositiva' : 'Nueva diapositiva'}</h3>
    <button class="icon-btn" onclick={onCerrar} aria-label="Cerrar">✕</button>
  </div>

  <div class="modal-body">
    {#if error}
      <div class="error-box">{error}</div>
    {/if}

    <div class="form-grid">
      <div class="field">
        <span>Título *</span>
        <input type="text" maxlength="120" bind:value={titulo} placeholder="Ej. Repuestos originales para tu moto" />
      </div>
      <div class="field">
        <span>Orden</span>
        <input type="number" min="0" max="999" bind:value={orden} />
      </div>
    </div>

    <div class="field">
      <span>Subtítulo</span>
      <input type="text" maxlength="200" bind:value={subtitulo} placeholder="Ej. Mantenimiento y rendimiento" />
    </div>

    <div class="field">
      <span>Descripción</span>
      <textarea rows="3" maxlength="400" bind:value={descripcion} placeholder="Texto breve que acompaña el título"></textarea>
    </div>

    <div class="form-grid">
      <div class="field">
        <span>Texto del botón</span>
        <input type="text" maxlength="40" bind:value={textoBoton} placeholder="Ver catálogo" />
      </div>
      <div class="field">
        <span>Enlace del botón</span>
        <input type="text" maxlength="300" bind:value={enlace} placeholder="#/catalogo" />
      </div>
    </div>

    <div class="field">
      <span>Imagen de fondo</span>
      {#if imagen}
        <div class="portada-form-preview">
          <img src={getImageUrl(imagen)} alt="Vista previa" />
          <button class="mini-btn danger" onclick={() => (imagen = '')}>Quitar imagen</button>
        </div>
      {/if}
      <div class="img-actions">
        <label class="btn btn-outline btn-sm">
          {subiendo ? 'Subiendo...' : 'Subir imagen'}
          <input type="file" accept="image/*" hidden onchange={subirArchivo} disabled={subiendo} />
        </label>
        <span class="meta-inline">o pega una URL:</span>
        <input
          type="url"
          class="url-input"
          bind:value={nuevaURL}
          placeholder="https://..."
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              usarURL();
            }
          }}
        />
        <button class="btn btn-outline btn-sm" onclick={usarURL}>Usar</button>
      </div>
    </div>

    <div class="form-checks">
      <label class="check">
        <input type="checkbox" bind:checked={activo} />
        <span>Visible en la portada</span>
      </label>
    </div>
  </div>

  <div class="modal-foot">
    <button class="btn btn-outline" onclick={onCerrar}>Cancelar</button>
    <button class="btn btn-primary" onclick={guardar} disabled={guardando || subiendo}>
      {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear diapositiva'}
    </button>
  </div>
</div>
