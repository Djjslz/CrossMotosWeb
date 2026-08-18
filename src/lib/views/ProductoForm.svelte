<script>
  import { api } from '../../lib/api.js';
  import { showToast } from '../store.svelte.js';

  let { producto, categorias, onCerrar, onGuardado } = $props();

  const esEdicion = !!producto;
  let nombre = $state(producto?.producto?.nombre ?? '');
  let codigo = $state(producto?.sku ?? '');
  let marca = $state(producto?.producto?.marca ?? '');
  let categoria = $state(String(producto?.producto?.categoria?._id ?? producto?.producto?.categoria ?? ''));
  let precio = $state(producto?.producto?.precio ?? '');
  let precioAnterior = $state(producto?.producto?.precioAnterior ?? '');
  let stock = $state(producto?.stock ?? 0);
  let descripcionCorta = $state(producto?.producto?.descripcionCorta ?? '');
  let descripcion = $state(producto?.producto?.descripcion ?? '');
  let destacado = $state(producto?.producto?.destacado ?? false);
  let activo = $state(producto?.producto?.activo ?? true);
  let imagenes = $state(producto?.producto?.imagenes ?? []);
  let nuevaURL = $state('');
  let guardando = $state(false);
  let subiendo = $state(false);
  let error = $state('');

  async function subirArchivos(event) {
    const archivos = Array.from(event.target.files || []);
    if (archivos.length === 0) return;
    subiendo = true;
    error = '';
    try {
      for (const archivo of archivos) {
        const fd = new FormData();
        fd.append('imagenes', archivo);
        const data = await api.upload('/uploads', fd);
        imagenes = [...imagenes, ...data.urls];
      }
      showToast('Imágenes subidas');
    } catch (err) {
      error = err.message;
    } finally {
      subiendo = false;
      event.target.value = '';
    }
  }

  function agregarURL() {
    const url = nuevaURL.trim();
    if (!url) return;
    imagenes = [...imagenes, url];
    nuevaURL = '';
  }

  function quitarImagen(url) {
    imagenes = imagenes.filter((i) => i !== url);
  }

  function subirImagen(esImagenLocal, url) {
    return esImagenLocal ? url.startsWith('/api/uploads/') : /^(https?:\/\/)/.test(url);
  }

  async function guardar() {
    if (!nombre.trim()) {
      error = 'El nombre es requerido';
      return;
    }
    if (!categoria) {
      error = 'Selecciona una categoría';
      return;
    }
    const payload = {
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      marca: marca.trim(),
      categoria,
      precio: Number(precio) || 0,
      precioAnterior: precioAnterior === '' || precioAnterior === null ? undefined : Number(precioAnterior),
      stock: Number(stock) || 0,
      descripcionCorta: descripcionCorta.trim(),
      descripcion: descripcion.trim(),
      destacado,
      activo,
      imagenes,
    };
    guardando = true;
    error = '';
    try {
      if (esEdicion) {
        await api.put(`/productos/${producto.producto._id}`, payload);
        showToast('Producto actualizado');
      } else {
        await api.post('/productos', payload);
        showToast('Producto creado');
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
    <h3>{esEdicion ? 'Editar producto' : 'Nuevo producto'}</h3>
    <button class="icon-btn" onclick={onCerrar} aria-label="Cerrar">✕</button>
  </div>

  <div class="modal-body">
    {#if error}
      <div class="error-box">{error}</div>
    {/if}

    <div class="form-grid">
      <div class="field">
        <span>Nombre *</span>
        <input type="text" bind:value={nombre} placeholder="Ej. Casco X-SPORTS V151" />
      </div>
      <div class="field">
        <span>Código (SKU)</span>
        <input type="text" bind:value={codigo} placeholder="Ej. 124393" disabled={esEdicion} />
      </div>
      <div class="field">
        <span>Categoría *</span>
        <select bind:value={categoria}>
          <option value="">Seleccionar...</option>
          {#each categorias as cat (cat._id)}
            <option value={String(cat._id)}>{cat.nombre}</option>
          {/each}
        </select>
      </div>
      <div class="field">
        <span>Marca</span>
        <input type="text" bind:value={marca} placeholder="Ej. X-SPORTS" />
      </div>
      <div class="field">
        <span>Precio (COP)</span>
        <input type="number" min="0" bind:value={precio} placeholder="0" />
      </div>
      <div class="field">
        <span>Precio anterior (COP)</span>
        <input type="number" min="0" bind:value={precioAnterior} placeholder="Opcional" />
      </div>
      <div class="field">
        <span>Stock</span>
        <input type="number" min="0" bind:value={stock} />
      </div>
      <div class="field">
        <span>Descripción corta</span>
        <input type="text" maxlength="200" bind:value={descripcionCorta} placeholder="Resumen para el catálogo" />
      </div>
    </div>

    <div class="field">
      <span>Descripción</span>
      <textarea rows="3" bind:value={descripcion} placeholder="Características del producto"></textarea>
    </div>

    <div class="field">
      <span>Imágenes</span>
      <div class="img-grid">
        {#each imagenes as img (img)}
          <div class="thumb">
            <img src={img} alt="" />
            <button class="thumb-remove" onclick={() => quitarImagen(img)} aria-label="Quitar imagen">✕</button>
          </div>
        {/each}
      </div>
      <div class="img-actions">
        <label class="btn btn-outline btn-sm">
          {subiendo ? 'Subiendo...' : 'Subir imágenes'}
          <input type="file" accept="image/*" multiple hidden onchange={subirArchivos} disabled={subiendo} />
        </label>
        <span class="meta-inline">o pega una URL:</span>
        <input type="url" class="url-input" bind:value={nuevaURL} placeholder="https://..." onkeydown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            agregarURL();
          }
        }} />
        <button class="btn btn-outline btn-sm" onclick={agregarURL}>Agregar</button>
      </div>
    </div>

    <div class="form-checks">
      <label class="check">
        <input type="checkbox" bind:checked={destacado} />
        <span>Destacado</span>
      </label>
      <label class="check">
        <input type="checkbox" bind:checked={activo} />
        <span>Activo (visible en el catálogo)</span>
      </label>
    </div>
  </div>

  <div class="modal-foot">
    <button class="btn btn-outline" onclick={onCerrar}>Cancelar</button>
    <button class="btn btn-primary" onclick={guardar} disabled={guardando || subiendo}>
      {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
    </button>
  </div>
</div>