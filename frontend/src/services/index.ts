import api from './api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  createdBy: string;
}

export interface ProductFormData {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },

  search: async (name: string): Promise<Product[]> => {
    const response = await api.get(`/products/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  create: async (data: ProductFormData): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id: number, data: ProductFormData): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  updateQuantity: async (id: number, quantity: number): Promise<void> => {
    await api.patch(`/products/${id}/quantity?quantity=${quantity}`);
  },
};

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
}

export const userService = {
  getCurrent: async (): Promise<User> => {
    const response = await api.get('/users/current');
    return response.data;
  },

  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export const introspectionService = {
  validateToken: async (): Promise<{ active: boolean; [key: string]: any }> => {
    const response = await api.post('/introspect');
    return response.data;
  },
};
