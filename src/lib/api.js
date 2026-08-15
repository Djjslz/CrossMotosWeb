const BASE = '/api';

export class ApiError extends Error {
  constructor(message, status = 500, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* sin cuerpo JSON */
  }

  if (!res.ok) {
    const msg = body?.message || `Error ${res.status}`;
    throw new ApiError(msg, res.status, body?.errors || []);
  }
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
