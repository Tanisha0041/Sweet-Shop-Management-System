import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  AuthResponse, 
  ApiResponse, 
  Sweet, 
  CreateSweetData, 
  UpdateSweetData,
  SearchParams 
} from '../types';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Create axios instance with default config
 */
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiInstance();

/**
 * Authentication API calls
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (email: string, username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      email,
      username,
      password,
    });
    return response.data;
  },

  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

/**
 * Sweets API calls
 */
export const sweetsApi = {
  /**
   * Get all sweets
   */
  getAll: async (): Promise<ApiResponse<Sweet[]>> => {
    const response = await api.get('/sweets');
    return response.data;
  },

  /**
   * Get a sweet by ID
   */
  getById: async (id: string): Promise<ApiResponse<Sweet>> => {
    const response = await api.get(`/sweets/${id}`);
    return response.data;
  },

  /**
   * Search sweets
   */
  search: async (params: SearchParams): Promise<ApiResponse<Sweet[]>> => {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());

    const response = await api.get(`/sweets/search?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Create a new sweet
   */
  create: async (data: CreateSweetData): Promise<ApiResponse<Sweet>> => {
    const response = await api.post('/sweets', data);
    return response.data;
  },

  /**
   * Update a sweet
   */
  update: async (id: string, data: UpdateSweetData): Promise<ApiResponse<Sweet>> => {
    const response = await api.put(`/sweets/${id}`, data);
    return response.data;
  },

  /**
   * Delete a sweet
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/sweets/${id}`);
    return response.data;
  },

  /**
   * Purchase a sweet
   */
  purchase: async (id: string, quantity: number = 1): Promise<ApiResponse<Sweet>> => {
    const response = await api.post(`/sweets/${id}/purchase`, { quantity });
    return response.data;
  },

  /**
   * Restock a sweet (admin only)
   */
  restock: async (id: string, quantity: number): Promise<ApiResponse<Sweet>> => {
    const response = await api.post(`/sweets/${id}/restock`, { quantity });
    return response.data;
  },
};

export default api;
