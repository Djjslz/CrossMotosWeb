const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'cm_admin_token';
const USER_KEY = 'cm_admin_user';

export class ApiError extends Error {
  constructor(message, status = 500, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function guardarSesion(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function limpiarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function estaAutenticado() {
  return Boolean(getToken());
}

async function request(path, options = {}) {
  const esFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!esFormData) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { headers, signal: controller.signal, ...options });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('El servidor tardó demasiado en responder. Reintenta.', 504);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* sin cuerpo JSON */
  }

  if (res.status === 401) {
    limpiarSesion();
    window.dispatchEvent(new Event('cm:sesion-caducada'));
  }

  if (!res.ok) {
    const msg = body?.message || `Error ${res.status}`;
    throw new ApiError(msg, res.status, body?.errors || []);
  }
  if (body && body.pagination) return body;
  return body?.data ?? body;
}

export const api = {
  get: (path, options) => request(path, { method: 'GET', ...options }),
  post: (path, data, options) =>
    request(path, { method: 'POST', body: JSON.stringify(data), ...options }),
  put: (path, data, options) =>
    request(path, { method: 'PUT', body: JSON.stringify(data), ...options }),
  del: (path, options) => request(path, { method: 'DELETE', ...options }),
  upload: (path, formData, options) =>
    request(path, { method: 'POST', body: formData, ...options }),
};
