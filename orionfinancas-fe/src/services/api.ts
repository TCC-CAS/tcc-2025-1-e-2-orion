const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getHeaders = (token?: string, path?: string) => {
  let authToken = token;
  
  if (!authToken && typeof window !== 'undefined') {
    const isAdminPath = path?.startsWith('/admin') || window.location.pathname.startsWith('/admin');
    authToken = (isAdminPath 
      ? localStorage.getItem('admin_token') || localStorage.getItem('token')
      : localStorage.getItem('token')) || undefined;
  }

  return {
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
  };
};

export const api = {
  get: async (path: string, token?: string) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'GET',
      headers: getHeaders(token, path),
    });
    return response.json();
  },

  post: async (path: string, body: any, token?: string) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(token, path),
      body: JSON.stringify(body),
    });
    return response.json();
  },

  put: async (path: string, body: any, token?: string) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers: getHeaders(token, path),
      body: JSON.stringify(body),
    });
    return response.json();
  },

  delete: async (path: string, body?: any, token?: string) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: getHeaders(token, path),
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  },
};
