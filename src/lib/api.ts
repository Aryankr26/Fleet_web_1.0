// API utility functions for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// Clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// User API
export const userApi = {
  list: () => apiRequest<Array<any>>('/api/users'),
  
  create: (data: { username: string; email?: string; password: string; role: string }) =>
    apiRequest<any>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (userId: number, data: { status?: string; role?: string }) =>
    apiRequest<any>(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (userId: number) =>
    apiRequest<{ ok: boolean }>(`/api/users/${userId}`, {
      method: 'DELETE',
    }),
};

// Vehicle API
export const vehicleApi = {
  list: () => apiRequest<Array<any>>('/api/vehicles'),
  
  create: (data: { imei: string; label?: string }) =>
    apiRequest<any>('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (imei: string, data: { label?: string }) =>
    apiRequest<any>(`/api/vehicles/${imei}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (imei: string) =>
    apiRequest<{ ok: boolean }>(`/api/vehicles/${imei}`, {
      method: 'DELETE',
    }),
};

// Geofence API
export const geofenceApi = {
  list: (activeOnly = false) => 
    apiRequest<Array<any>>(`/api/geofences?active=${activeOnly}`),
  
  create: (data: any) =>
    apiRequest<any>('/api/geofences', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  delete: (geofenceId: number) =>
    apiRequest<{ ok: boolean }>(`/api/geofences/${geofenceId}`, {
      method: 'DELETE',
    }),
};

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ access_token: string; token_type: string; role: string }>(
      '/api/auth/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }).toString(),
      }
    ),
};
