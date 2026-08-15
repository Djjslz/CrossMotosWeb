<script>
  import { navigate } from '../router.js';
  import { categorias } from '../store.js';

  let { activeSlug = null } = $props();
</script>

<nav class="cat-nav" aria-label="Categorías">
  <button
    class="cat-chip"
    class:active={!activeSlug}
    onclick={() => navigate('/catalogo')}
  >
    Todos
  </button>
  {#each categorias as cat (cat._id)}
    <button
      class="cat-chip"
      class:active={cat.slug === activeSlug}
      onclick={() => navigate(`/catalogo?categoria=${cat.slug}`)}
    >
      {cat.nombre}
    </button>
  {/each}
</nav>
