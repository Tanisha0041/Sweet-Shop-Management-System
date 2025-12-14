/**
 * User role enum
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sweet category enum
 */
export enum SweetCategory {
  CHOCOLATE = 'chocolate',
  CANDY = 'candy',
  COOKIE = 'cookie',
  CAKE = 'cake',
  PASTRY = 'pastry',
  ICE_CREAM = 'ice_cream',
  OTHER = 'other',
}

/**
 * Sweet interface
 */
export interface Sweet {
  id: string;
  name: string;
  description?: string;
  category: SweetCategory;
  price: number;
  quantity: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create sweet data
 */
export interface CreateSweetData {
  name: string;
  description?: string;
  category: SweetCategory;
  price: number;
  quantity: number;
  imageUrl?: string;
}

/**
 * Update sweet data
 */
export interface UpdateSweetData {
  name?: string;
  description?: string;
  category?: SweetCategory;
  price?: number;
  quantity?: number;
  imageUrl?: string;
}

/**
 * Auth response
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

/**
 * API Response
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Array<{ msg: string; param: string }>;
}

/**
 * Search params for sweets
 */
export interface SearchParams {
  name?: string;
  category?: SweetCategory;
  minPrice?: number;
  maxPrice?: number;
}
