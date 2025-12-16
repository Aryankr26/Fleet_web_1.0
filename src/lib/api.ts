// API utility functions for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Type definitions
export interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  status: string;
  created_at_ms?: number;
  last_login_ms?: number;
}

export interface Vehicle {
  imei: string;
  label?: string;
  last_lat?: number;
  last_lon?: number;
  last_speed?: number;
  last_ignition?: boolean;
  last_fuel?: number;
  last_seen_ms?: number;
}

export interface Geofence {
  id: number;
  name: string;
  category?: string;
  type: string;
  center_lat?: number;
  center_lon?: number;
  radius_m?: number;
  polygon?: number[][];
  active: boolean;
  start_time?: string;
  end_time?: string;
  assigned_user_id?: number;
  created_by_user_id?: number;
  created_at_ms?: number;
}

export interface CreateUserRequest {
  username: string;
  email?: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  status?: string;
  role?: string;
}

export interface CreateVehicleRequest {
  imei: string;
  label?: string;
}

export interface UpdateVehicleRequest {
  label?: string;
}

export interface CreateGeofenceRequest {
  name: string;
  category?: string;
  type: string;
  center_lat?: number;
  center_lon?: number;
  radius_m?: number;
  polygon?: number[][];
  active?: boolean;
  start_time?: string;
  end_time?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}

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
  list: () => apiRequest<User[]>('/api/users'),
  
  create: (data: CreateUserRequest) =>
    apiRequest<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (userId: number, data: UpdateUserRequest) =>
    apiRequest<User>(`/api/users/${userId}`, {
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
  list: () => apiRequest<Vehicle[]>('/api/vehicles'),
  
  create: (data: CreateVehicleRequest) =>
    apiRequest<Vehicle>('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (imei: string, data: UpdateVehicleRequest) =>
    apiRequest<Vehicle>(`/api/vehicles/${imei}`, {
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
    apiRequest<Geofence[]>(`/api/geofences?active=${activeOnly}`),
  
  create: (data: CreateGeofenceRequest) =>
    apiRequest<Geofence>('/api/geofences', {
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
    apiRequest<LoginResponse>(
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
