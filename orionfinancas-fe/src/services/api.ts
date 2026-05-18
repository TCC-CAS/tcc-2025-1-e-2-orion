const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getHeaders = (token?: string, path?: string) => {
  return {
    'Content-Type': 'application/json',
  };
};

async function parseResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    throw { status: response.status, ...data };
  }
  return data;
}

export const api = {
  get: async (path: string, token?: string) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'GET',
      headers: getHeaders(token, path),
      credentials: 'include',
    });
    return parseResponse(response);
  },

  post: async (path: string, body: any, token?: string) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(token, path),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  put: async (path: string, body: any, token?: string) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers: getHeaders(token, path),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  delete: async (path: string, body?: any, token?: string) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: getHeaders(token, path),
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    return parseResponse(response);
  },
};
