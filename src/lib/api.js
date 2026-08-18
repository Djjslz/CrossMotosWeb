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
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* sin cuerpo JSON */
  }

  if (res.status === 401) {
    limpiarSesion();
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
};
