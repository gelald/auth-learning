// Keycloak 配置
export const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'demo-realm',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'demo-frontend',
};

// 后端配置
export const backendConfig = {
  url: import.meta.env.VITE_BACKEND_URL || 'http://localhost:21301',
};

// 前端配置
export const frontendConfig = {
  port: Number(import.meta.env.VITE_FRONTEND_PORT) || 3000,
};

// OIDC 配置（供 react-oidc-context 使用）
export const oidcConfig = {
  authority: `${keycloakConfig.url}/realms/${keycloakConfig.realm}`,
  client_id: keycloakConfig.clientId,
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  scope: 'openid profile email',
  automaticSilentRenew: true,
  validateSubOnSilentRenew: true,
};

// 导出完整配置对象（可选）
export const config = {
  keycloak: keycloakConfig,
  backend: backendConfig,
  frontend: frontendConfig,
};
