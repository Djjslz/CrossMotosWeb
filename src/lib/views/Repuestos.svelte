<script>
  import CatalogoCategoria from '../components/CatalogoCategoria.svelte';

  let { query = {} } = $props();
</script>

<CatalogoCategoria
  categoria="repuestos"
  kicker="Mantenimiento y rendimiento"
  titulo="Repuestos"
  tituloAcento="para motos"
  descripcion="Repuestos, componentes y partes de recambio para tu moto. Encuentra lo que necesitas y solicita tu cotización sin compromiso."
  nombrePlural="repuestos"
  nombreSingular="repuesto"
  buscarPlaceholder="Buscar repuesto por nombre o referencia..."
  ctaSecundarioTexto="Accesorios"
  ctaSecundarioEnlace="#/accesorios"
  {query}
/>
