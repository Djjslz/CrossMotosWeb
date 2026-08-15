export function formatCOP(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPrecioUnitario(precio, cantidad) {
  if (!cantidad || cantidad <= 1) return formatCOP(precio);
  return `${formatCOP(precio)} / und`;
}
