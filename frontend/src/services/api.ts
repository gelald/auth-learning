import axios from 'axios';
import { UserManager } from 'oidc-client-ts';
import { keycloakConfig } from '../config';

const userManager = new UserManager({
  authority: `${keycloakConfig.url}/realms/${keycloakConfig.realm}`,
  client_id: keycloakConfig.clientId,
  redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid profile email',
});

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const user = await userManager.getUser();
      if (user && user.access_token) {
        config.headers.Authorization = `Bearer ${user.access_token}`;
      }
    } catch (error) {
      console.error('Failed to get user token', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
