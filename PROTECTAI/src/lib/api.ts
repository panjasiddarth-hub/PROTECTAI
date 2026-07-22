import { getDemoMutation, getDemoResponse } from './demoData';

// Tiny fetch wrapper for the /api/* serverless routes. In simulation mode the
// same client transparently falls back to seeded digital-twin data, allowing
// the MVP to run without physical sensors or a configured backend.

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    if (!res.ok) {
      throw new Error(`API ${path} failed: ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    // Vite does not execute the Vercel /api functions locally. Falling back to
    // the digital twin keeps the UI useful for demos and development.
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const demo = init?.method && init.method !== 'GET'
      ? getDemoMutation<T>(path, body)
      : getDemoResponse<T>(path);
    if (demo !== undefined) return demo;
    throw error;
  }
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T,>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
};
