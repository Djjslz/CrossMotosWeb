<script>
  import CatalogoCategoria from '../components/CatalogoCategoria.svelte';

  let { query = {} } = $props();
</script>

<CatalogoCategoria
  categoria="accesorios"
  kicker="Estilo y equipamiento"
  titulo="Accesorios"
  tituloAcento="para tu moto"
  descripcion="Personaliza y equipa tu moto con accesorios de calidad: portaplacas, espejos, sliders, tapas, soportes y más. Solicita tu cotización sin compromiso."
  nombrePlural="accesorios"
  nombreSingular="accesorio"
  buscarPlaceholder="Buscar accesorio por nombre o referencia..."
  ctaSecundarioTexto="Repuestos"
  ctaSecundarioEnlace="#/repuestos"
  {query}
/>
