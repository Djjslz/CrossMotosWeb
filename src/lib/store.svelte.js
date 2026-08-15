import { api } from './api.js';

export const categorias = $state([]);
export const carrito = $state([]);
export const toast = $state({ mensaje: null, tipo: 'success' });

export const destacados = $state([]);
let categoriasCargando = false;
let destacadosCargando = false;

let toastTimer = null;

export function showToast(mensaje, tipo = 'success') {
  toast.mensaje = mensaje;
  toast.tipo = tipo;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.mensaje = null;
  }, 3500);
}

export async function cargarCategorias() {
  if (categorias.length > 0 || categoriasCargando) return;
  categoriasCargando = true;
  try {
    const data = await api.get('/categorias');
    categorias.length = 0;
    categorias.push(...data);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    categoriasCargando = false;
  }
}

export async function cargarDestacados() {
  if (destacados.length > 0 || destacadosCargando) return;
  destacadosCargando = true;
  try {
    const data = await api.get('/productos/destacados');
    destacados.length = 0;
    destacados.push(...data);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    destacadosCargando = false;
  }
}

export function agregarAlCarrito(producto, cantidad = 1) {
  const existente = carrito.find((i) => i.producto._id === producto._id);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ producto, cantidad });
  }
  showToast(`${producto.nombre} agregado al carrito`);
}

export function cambiarCantidad(productoId, delta) {
  const item = carrito.find((i) => i.producto._id === productoId);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    const idx = carrito.findIndex((i) => i.producto._id === productoId);
    carrito.splice(idx, 1);
  }
}

export function getTotalCarrito() {
  return carrito.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);
}

export function getCantidadTotal() {
  return carrito.reduce((acc, i) => acc + i.cantidad, 0);
}
