<script>
  import { onMount } from 'svelte';
  import { api } from '../../lib/api.js';
  import { showToast } from '../store.svelte.js';

  let items = $state([]);
  let pagination = $state({ page: 1, total: 0, totalPages: 1, limit: 10 });
  let cargando = $state(true);
  let error = $state('');
  let filtroLeido = $state('');

  function formatearFecha(iso) {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async function cargar() {
    cargando = true;
    error = '';
    try {
      const q = new URLSearchParams({ page: pagination.page, limit: pagination.limit });
      if (filtroLeido) q.set('leido', filtroLeido);
      const data = await api.get(`/contactos?${q}`);
      items = data?.data ?? [];
      pagination = data?.pagination ?? pagination;
    } catch (err) {
      error = err.message;
    } finally {
      cargando = false;
    }
  }

  function cambiarPagina(p) {
    if (p < 1 || p > pagination.totalPages) return;
    pagination.page = p;
    cargar();
  }

  function alternarFiltro() {
    pagination.page = 1;
    cargar();
  }

  async function toggleLeido(item) {
    try {
      const data = await api.put(`/contactos/${item._id}/leido`, { leido: !item.leido });
      item.leido = data.leido;
      showToast(item.leido ? 'Marcado como leído' : 'Marcado como no leído');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function eliminar(item) {
    if (!confirm('¿Eliminar este mensaje?')) return;
    try {
      await api.del(`/contactos/${item._id}`);
      items = items.filter((i) => i._id !== item._id);
      pagination.total = Math.max(0, pagination.total - 1);
      showToast('Mensaje eliminado');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  onMount(cargar);
</script>

<div class="admin-toolbar">
  <h3>Mensajes de contacto</h3>
  <select class="select" bind:value={filtroLeido} onchange={alternarFiltro} aria-label="Filtrar por estado de lectura">
    <option value="">Todos</option>
    <option value="false">No leídos</option>
    <option value="true">Leídos</option>
  </select>
</div>

{#if error}
  <div class="error-box">
    <span>{error}</span>
    <button class="btn btn-outline btn-sm" onclick={cargar}>Reintentar</button>
  </div>
{/if}

{#if cargando}
  <div class="loading"><div class="spinner"></div><p>Cargando mensajes...</p></div>
{:else if items.length === 0}
  <div class="empty-state"><p>No hay mensajes.</p></div>
{:else}
  {#each items as item (item._id)}
    <div class="msg-card" class:no-leido={!item.leido}>
      <div class="msg-head">
        <div>
          <span class="who">{item.nombre}</span>
          {#if !item.leido}
            <span class="badge badge-destacado">Nuevo</span>
          {/if}
        </div>
        <span class="meta">{formatearFecha(item.createdAt)}</span>
      </div>
      {#if item.asunto}
        <div class="msg-asunto">{item.asunto}</div>
      {/if}
      <div class="msg-body">{item.mensaje}</div>
      <div class="msg-foot">
        <span class="meta">
          {item.telefono}
          {#if item.email} · {item.email}{/if}
          {#if item.origen} · vía {item.origen}{/if}
        </span>
        <div class="row-actions">
          <button class="mini-btn" onclick={() => toggleLeido(item)}>
            {item.leido ? 'Marcar no leído' : 'Marcar leído'}
          </button>
          <button class="mini-btn danger" onclick={() => eliminar(item)}>Eliminar</button>
        </div>
      </div>
    </div>
  {/each}

  {#if pagination.totalPages > 1}
    <div class="pagination">
      <button
        class="page-btn"
        disabled={pagination.page <= 1}
        onclick={() => cambiarPagina(pagination.page - 1)}
      >
        ←
      </button>
      {#each Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1) as p (p)}
        <button class="page-btn" class:active={p === pagination.page} onclick={() => cambiarPagina(p)}>
          {p}
        </button>
      {/each}
      <button
        class="page-btn"
        disabled={pagination.page >= pagination.totalPages}
        onclick={() => cambiarPagina(pagination.page + 1)}
      >
        →
      </button>
    </div>
  {/if}
{/if}