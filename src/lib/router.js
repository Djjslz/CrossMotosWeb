import { api } from './api.js';

export function parseHash() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const [path, queryStr] = hash.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryStr || ''));
  return { path: path || '/', query };
}

export function navigate(path) {
  window.location.hash = path;
}

export const routes = {
  home: '/',
  catalog: '/catalogo',
  product: (slug) => `/producto/${slug}`,
};

export async function getProductos(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return api.get(`/productos?${q.toString()}`);
}

export async function getProducto(slug) {
  return api.get(`/productos/${slug}`);
}

export async function getDestacados() {
  return api.get('/productos/destacados');
}

export async function getCategorias() {
  return api.get('/categorias');
}
