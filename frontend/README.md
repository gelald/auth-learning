# OIDC Demo 前端

使用 Keycloak OIDC 认证和 PKCE 流程的 React 前端应用。

## 技术栈

- React 18
- TypeScript
- react-oidc-context (OIDC 客户端)
- react-router-dom (路由)
- axios (HTTP 客户端)
- Vite (构建工具)

## 项目结构

```
src/
├── config/
│   ├── index.ts             # 统一配置管理
│   └── oidc.ts              # OIDC 配置（从 index.ts 导出）
├── components/
│   └── Layout.tsx           # 主布局（含导航栏）
├── pages/
│   ├── HomePage.tsx         # 首页（登录/用户信息）
│   ├── ProductsPage.tsx     # 产品 CRUD 页面
│   ├── UsersPage.tsx        # 用户管理页面（管理员）
│   └── CallbackPage.tsx     # OIDC 回调处理
├── services/
│   ├── api.ts               # Axios 配置（含 Token 拦截器）
│   └── index.ts             # API 服务（Products, Users, Introspection）
├── styles/
│   └── index.css            # 全局样式
├── App.tsx                  # 主应用组件
└── main.tsx                 # 入口文件
```

## 配置说明

### 环境变量配置 (.env)

在项目根目录创建 `.env` 文件：

```bash
# Keycloak 配置
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=demo-realm
VITE_KEYCLOAK_CLIENT_ID=demo-frontend

# 后端配置
VITE_BACKEND_URL=http://localhost:21301

# 前端配置
VITE_FRONTEND_PORT=3000
```

**注意**: 
- 修改配置后需要重启开发服务器
- `.env` 文件不会被提交到 Git（已配置 .gitignore）
- 可以复制 `.env.example` 模板创建

### 统一配置模块 (src/config/index.ts)

所有配置从统一模块读取：

```typescript
import { keycloakConfig, oidcConfig, backendConfig } from './config';

console.log(keycloakConfig.url);      // Keycloak URL
console.log(oidcConfig.authority);    // OIDC authority
console.log(backendConfig.url);       // 后端 API URL
```

### Keycloak 客户端配置

在 Keycloak Admin Console 中配置前端客户端：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Client ID | `demo-frontend` | 客户端标识 |
| Client Type | OpenID Connect | 协议类型 |
| Access Type | `public` | 公开客户端 |
| Standard Flow | `ON` | 启用标准流程 |
| Direct Access Grants | `OFF` | 禁用直接授权 |
| Valid Redirect URIs | `http://localhost:3000/*` | 重定向 URI |
| Web Origins | `+` | 允许所有 CORS 源 |
| PKCE | 自动启用 | S256 算法 |

### Roles 配置（关键）

**在 Keycloak 中配置 Token Mapper**，使前端能正确读取用户角色：

1. 访问 Keycloak Admin Console
2. 选择 `demo-realm`
3. 路径：`Client scopes` → `roles` → `realm-roles` (Mapper)
4. 配置：
   - **ID Token Claim**: `ON` ✅
   - **Access Token Claim**: `ON` ✅
   - **Claim name**: `roles`
   - **Multivalued**: `ON` ✅

**配置后的效果**：
```typescript
// ✅ 可以从 auth.user.profile.roles 直接读取
const roles = auth.user?.profile?.roles;  // ["user"] 或 ["admin"]

// ✅ 用于权限判断
{auth.user?.profile?.roles?.includes('admin') && (
  <Link to="/users">Users</Link>
)}
```

详见：[stage-record-02.md](../stage-record-02.md#keycloak-roles-配置问题与解决)

---

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

应用将在 `http://localhost:3000` 可用

### 构建生产版本

```bash
pnpm run build
```

### 预览生产构建

```bash
pnpm run preview
```

### 代码检查

```bash
pnpm run lint
```

---

## 核心功能

### 认证流程 (PKCE)

1. 用户点击 "Login"
2. 生成 `code_verifier` 和 `code_challenge`
3. 重定向到 Keycloak 登录页
4. 用户认证成功
5. Keycloak 返回 authorization code
6. 使用 code + verifier 交换 access token
7. Token 存储并用于 API 请求

**PKCE 由 react-oidc-context 自动处理，无需手动实现。**

### Token 管理

- ✅ 自动 Token 刷新（Silent Renew）
- ✅ Token Introspection 按需校验
- ✅ 401 错误处理（自动跳转登录）
- ✅ Axios 拦截器自动添加 Authorization 头

### 路由保护

- `/products` - 需要认证（任何登录用户）
- `/users` - 需要 admin 角色

### API 集成

- ✅ 统一 Axios 拦截器（自动注入 Token）
- ✅ 错误处理（401 自动跳转）
- ✅ 加载状态
- ✅ 统一服务层封装

---

## 页面说明

### 首页 (`/`)

**访问权限**: 公开

**功能**:
- 未登录：显示欢迎信息和登录按钮
- 已登录：显示用户信息（用户名、邮箱、角色等）

**关键代码**:
```typescript
const auth = useAuth();

// 判断是否已登录
{!auth.isAuthenticated ? (
  <button onClick={() => auth.signinRedirect()}>Login</button>
) : (
  <div>欢迎，{auth.user?.profile?.preferred_username}!</div>
)}
```

### 产品页面 (`/products`)

**访问权限**: 认证用户

**功能**:
- 产品列表展示
- 创建产品
- 编辑产品
- 删除产品
- 搜索和筛选

**关键代码**:
```typescript
// 从 API 服务获取数据
const products = await productService.getAll();

// 创建产品
await productService.create(formData);
```

### 用户管理页面 (`/users`)

**访问权限**: 管理员 (admin 角色)

**功能**:
- 用户列表展示
- 删除用户

**权限控制**:
```typescript
// Layout.tsx - 根据角色显示导航
{auth.user?.profile?.roles?.includes('admin') && (
  <Link to="/users">Users</Link>
)}
```

### 回调页面 (`/callback`)

**访问权限**: 公开（OIDC 回调专用）

**功能**:
- 处理 Keycloak 认证回调
- 错误处理
- 重定向到产品页面

---

## API 代理配置

Vite 开发服务器代理 `/api` 请求到后端：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:21301',  // 后端地址
        changeOrigin: true
      }
    }
  }
})
```

**优点**:
- 避免 CORS 问题
- 开发环境和生产环境使用相同的前缀 `/api`
- 不需要在代码中配置完整的后端 URL

---

## 样式系统

自定义 CSS，包含：

- ✅ 响应式设计（适配移动端）
- ✅ 组件化样式（可复用）
- ✅ 一致的颜色方案
- ✅ Material Design 风格

**主要样式类**:
- `.container` - 页面容器
- `.card` - 卡片组件
- `.btn` - 按钮
- `.table` - 表格
- `.modal-overlay` - 模态框
- `.alert` - 提示框

详见：[src/styles/index.css](./src/styles/index.css)

---

## 测试流程

### 完整认证流程测试

1. **启动 Keycloak**:
   ```bash
   cd ../keycloak
   docker-compose up -d
   ```

2. **启动后端** (新终端):
   ```bash
   cd ../backend
   mvn spring-boot:run
   ```

3. **启动前端** (新终端):
   ```bash
   pnpm run dev
   ```

4. **测试登录**:
   - 访问 http://localhost:3000
   - 点击 "Login"
   - 使用 `testuser` / `testpass` 登录
   - 成功登录后显示用户信息

5. **测试产品功能**:
   - 访问 /products
   - 创建、编辑、删除产品
   - 检查 Network 中 Authorization 头

6. **测试权限控制**:
   - 使用 `testuser` 登录 → 不能访问 /users
   - 使用 `admin` 登录 → 可以访问 /users

7. **测试 Token Introspection**:
   - 点击 "Check Token" 按钮
   - 查看 Token 详情

---

## 常见问题

### 登录循环（Login Loop）

**症状**: 登录后又跳回登录页

**解决方案**:
1. 检查 Keycloak 客户端的 Valid Redirect URIs 是否包含 `http://localhost:3000/*`
2. 确认 Client ID 匹配 (`demo-frontend`)
3. 清除浏览器缓存和 Cookie
4. 检查浏览器 Console 是否有错误

### 401 Unauthorized

**症状**: API 请求返回 401

**解决方案**:
1. 检查 Token 是否过期（默认 5 分钟）
2. 检查浏览器 Network 中 Authorization 头是否存在
3. 验证后端 JWT 配置（JWKS URI 是否正确）
4. 检查 Keycloak Realm 设置

### CORS 错误

**症状**: 浏览器报 CORS 错误

**解决方案**:
1. 确保 Keycloak 客户端的 Web Origins 配置为 `+`
2. 检查后端 SecurityConfig 中的 CORS 配置
3. 确认 Vite 代理配置正确

### 读取不到用户角色 (roles)

**症状**: `auth.user.profile.roles` 为 undefined

**解决方案**:
1. 检查 Keycloak 中的 Token Mapper 配置（见上方 Roles 配置）
2. 确认启用了 **ID Token Claim**
3. 修改后需要 **重新登录** 才能生效
4. 在浏览器 Console 中打印 `auth.user` 查看完整结构

详见：[stage-record-02.md](../stage-record-02.md#keycloak-roles-配置问题与解决)

### Token 刷新失败

**症状**: Token 过期后无法自动刷新

**解决方案**:
1. 检查 `oidcConfig` 中是否启用 `automaticSilentRenew: true`
2. 确认 Keycloak 客户端配置了正确的重定向 URI
3. 检查浏览器 Console 是否有 silent renew 相关错误

---

## 环境变量说明

### 可用的环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_KEYCLOAK_URL` | `http://localhost:8080` | Keycloak 服务地址 |
| `VITE_KEYCLOAK_REALM` | `demo-realm` | Realm 名称 |
| `VITE_KEYCLOAK_CLIENT_ID` | `demo-frontend` | 客户端 ID |
| `VITE_BACKEND_URL` | `http://localhost:21301` | 后端 API 地址 |
| `VITE_FRONTEND_PORT` | `3000` | 前端开发服务器端口 |

### 使用环境变量

```typescript
// 在代码中访问
const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL;
const backendUrl = import.meta.env.VITE_BACKEND_URL;
```

### 多环境配置

创建不同环境的 `.env` 文件：

```bash
# 开发环境
.env.development

# 生产环境
.env.production

# 测试环境
.env.test
```

Vite 会自动根据 `pnpm run dev` / `pnpm run build` 加载对应的环境变量文件。

---

## 相关文档

- [项目总览](../README.md) - 项目整体介绍
- [快速启动](../QUICKSTART.md) - 5 分钟快速上手
- [阶段记录 02](../stage-record-02.md) - 前后端联调问题排查
- [Keycloak 文档](../keycloak/README.md) - Keycloak 配置说明
- [技术笔记](../Web-and-Http.md) - Spring Security 深入理解

---

**最后更新**: 2026-02-26  
**React 版本**: 18.2.0  
**Node.js 要求**: 18+  
**包管理器**: pnpm
