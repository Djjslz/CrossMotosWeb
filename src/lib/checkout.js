import { formatCOP } from './format.js';

export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/[^0-9]/g, '');

export function construirPayloadPedido(carrito, cliente, tipoEntrega, medioContacto) {
  return {
    cliente: {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email || '',
      ciudad: cliente.ciudad || '',
      direccion: cliente.direccion || '',
      notas: cliente.notas || '',
    },
    items: carrito.map((i) => ({ codigo: i.producto.codigo, cantidad: i.cantidad })),
    tipoEntrega,
    medioContacto,
  };
}

export function construirMensajeWhatsApp(items, cliente, tipoEntrega, numeroPedido = null) {
  const lineas = items.map(
    (i, idx) => `${idx + 1}. ${i.nombre} x${i.cantidad} — ${formatCOP(i.precio * i.cantidad)}`
  );
  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const entrega = tipoEntrega === 'envio' ? 'Envío' : 'Recojo en tienda';

  let msg = 'Hola CrossMotos, quiero una cotización:\n\n';
  msg += lineas.join('\n');
  msg += `\n\nSubtotal: ${formatCOP(total)}`;
  msg += `\nEntrega: ${entrega}`;
  msg += `\n\nCliente: ${cliente.nombre}`;
  msg += `\nTeléfono: ${cliente.telefono}`;
  if (cliente.email) msg += `\nEmail: ${cliente.email}`;
  if (cliente.ciudad) msg += `\nCiudad: ${cliente.ciudad}`;
  if (cliente.direccion) msg += `\nDirección: ${cliente.direccion}`;
  if (cliente.notas) msg += `\nNotas: ${cliente.notas}`;
  if (numeroPedido) msg += `\n\nCódigo de cotización: ${numeroPedido}`;
  return msg;
}

export function abrirWhatsApp(mensaje) {
  if (!WHATSAPP_NUMBER) return false;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank', 'noopener');
  return true;
}