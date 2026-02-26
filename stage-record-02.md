# Stage Record 02 - 前后端联调与配置优化

## 📅 阶段信息

**时间**: 2026-02-25  
**目标**: 完成前后端联调，解决集成问题，优化配置管理  
**状态**: ✅ 完成

---

## 🎯 阶段目标

1. 修复 Token Introspection 401 错误
2. 修复 API 请求未携带 Authorization 头的问题
3. 统一配置管理，避免端口配置不一致
4. 创建 Keycloak 可复用配置

---

## 🐛 问题与解决方案

### 问题 1: Token Introspection 返回 401

**现象**: 点击 Check Token 按钮返回 500 错误，后端日志显示 authentication 为 null

**原因**: 
- `SecurityConfig.java` 中 `/api/introspect/**` 配置了 `permitAll()`
- 导致请求不经过 OAuth2 认证流程，Authentication 对象为 null

**解决方案**:
```java
// 删除这行
.requestMatchers(new AntPathRequestMatcher("/api/introspect/**")).permitAll()
```

**文件**: `backend/src/main/java/com/example/demo/config/SecurityConfig.java:48`

---

### 问题 2: 前端 API 请求未携带 Authorization 头

**现象**: 访问 `/api/products` 返回 401，请求头中没有 Authorization

**原因分析**:
1. `react-oidc-context` 存储 token 的 key 格式是 `oidc.user:{authority}:{clientId}`
2. 代码中使用 `sessionStorage.getItem('oidc.user')` 无法获取到 token
3. Axios interceptor 无法正确读取 token

**解决方案选项对比**:

| 方案 | 描述 | 选择 |
|------|------|------|
| 方案 A | 使用 useAuth + fetch | ❌ 需要修改所有调用 |
| 方案 B | 全局变量同步 token | ❌ 非标准做法 |
| 方案 C | 自定义 axios 工厂 | ❌ 代码改动大 |
| **方案 1** | **使用 UserManager 获取 token** | ✅ **最终选择** |

**最终实现** (`frontend/src/services/api.ts`):
```typescript
import { UserManager } from 'oidc-client-ts';

const userManager = new UserManager({
  authority: 'http://localhost:8080/realms/demo-realm',
  client_id: 'demo-frontend',
  redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid profile email',
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
  (error) => Promise.reject(error)
);
```

---

### 问题 3: Keycloak 端口配置不一致

**现象**: 修改了 api.ts 的端口后仍然无法获取 token

**发现**:
- `oidcConfig.ts`: authority = `http://localhost:8080`
- `api.ts`: authority = `http://localhost:8081`
- 实际 Keycloak 运行在 `8080`

**解决方案**: 统一端口配置为 `8080`

---

### 问题 4: 配置分散，维护困难

**现象**: Keycloak 配置分散在多个文件中，修改端口需要改多处

**配置分布**:
- `frontend/src/config/oidc.ts` - OIDC 配置
- `frontend/src/services/api.ts` - UserManager 配置
- `frontend/vite.config.ts` - 代理配置
- `backend/application.yml` - Keycloak 连接配置

**解决方案**: 实施**方案 B - 全局配置 + 环境变量**

**实现**:

1. **创建 `.env` 文件** (`frontend/.env`):
```bash
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=demo-realm
VITE_KEYCLOAK_CLIENT_ID=demo-frontend
VITE_BACKEND_URL=http://localhost:21301
VITE_FRONTEND_PORT=3000
```

2. **创建统一配置模块** (`frontend/src/config/index.ts`):
```typescript
export const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'demo-realm',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'demo-frontend',
};

export const oidcConfig = {
  authority: `${keycloakConfig.url}/realms/${keycloakConfig.realm}`,
  client_id: keycloakConfig.clientId,
  // ...
};
```

3. **修改所有使用处**:
   - `api.ts`: 从 `keycloakConfig` 读取
   - `vite.config.ts`: 使用环境变量
   - `oidc.ts`: 从统一配置导出

**优点**:
- ✅ 所有配置集中在 `.env` 文件
- ✅ 修改端口只需改一个地方
- ✅ 支持多环境（dev/prod）
- ✅ 团队协作更简单（.env.example）

---

## 📦 Keycloak 可复用配置创建

### 创建的文件

```
keycloak/
├── docker-compose.yml           # Keycloak 22 Docker 配置
├── README.md                    # 详细使用文档
├── .gitignore
├── start.sh / start.bat         # 快速启动脚本
└── realm-config/
    ├── demo-realm.json         # Realm 导出文件
    └── CLIENT_SECRET.md        # Client Secret 说明
```

### Realm 配置内容

**包含**:
- ✅ Realm: `demo-realm`
- ✅ 客户端：`demo-frontend`, `demo-backend`
- ✅ 角色：`user`, `admin`
- ✅ 用户：`testuser/testpass`, `admin/adminpass`
- ✅ Token Mapper: `realm-roles` (映射到 `roles` claim)
- ✅ PKCE 配置：S256

### 使用方法

```bash
cd keycloak
docker-compose up -d
```

**等待 30-60 秒**，Realm 自动导入完成。

### Client Secret 获取

1. 访问 http://localhost:8080/admin
2. 登录：`admin` / `admin`
3. 选择 `demo-realm`
4. Clients → `demo-backend` → Credentials
5. 复制 Client secret 到 `backend/application.yml`

详见：`keycloak/realm-config/CLIENT_SECRET.md`

---

## 🛠️ 代码修改清单

### 后端修改

| 文件 | 修改内容 | 行数 |
|------|----------|------|
| `SecurityConfig.java` | 删除 `/api/introspect/**` 的 permitAll 配置 | -1 |

### 前端修改

| 文件 | 修改内容 | 说明 |
|------|----------|------|
| `frontend/.env` | 新建环境变量配置 | 集中管理所有配置 |
| `frontend/.env.example` | 新建环境模板 | Git 提交 |
| `frontend/src/config/index.ts` | 新建统一配置模块 | 核心配置文件 |
| `frontend/src/config/oidc.ts` | 简化为导出 | 从 index.ts 导入 |
| `frontend/src/services/api.ts` | 使用 UserManager | 从配置读取 |
| `frontend/src/components/Layout.tsx` | 使用 fetch + auth | Check Token 按钮 |
| `frontend/vite.config.ts` | 使用环境变量 | 动态配置端口 |
| `frontend/.gitignore` | 忽略.env 文件 | 安全考虑 |

---

## 📊 配置对比（修改前后）

### 修改前

```typescript
// api.ts - 错误的存储 key
const user = JSON.parse(sessionStorage.getItem('oidc.user') || '{}');

// 硬编码的端口
authority: 'http://localhost:8081/realms/demo-realm'
```

### 修改后

```typescript
// api.ts - 使用 UserManager
const user = await userManager.getUser();

// 从环境变量读取
authority: `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}`
```

---

## 🧪 验证步骤

### 1. Keycloak 验证
```bash
cd keycloak
docker-compose up -d
curl http://localhost:8080/health/ready
```

### 2. 后端验证
```bash
cd backend
mvn spring-boot:run
curl http://localhost:21301/api/public/health
```

### 3. 前端验证
```bash
cd frontend
npm run dev
# 访问 http://localhost:3000
```

### 4. 认证流程验证
1. 访问首页 → 点击 Login
2. 跳转到 Keycloak 登录页
3. 输入 `testuser` / `testpass`
4. 成功登录，返回前端首页
5. 显示用户信息

### 5. API 验证
1. 访问 `/products` → 显示产品列表
2. 检查 Network 请求 → 有 Authorization 头
3. 创建产品 → 成功
4. 删除产品 → 成功

### 6. Token Introspection 验证
1. 点击 **Check Token** 按钮
2. 弹窗显示 token 信息
3. `active: true`

### 7. 权限验证
1. 使用 `testuser` 登录 → 可以访问 products
2. 使用 `testuser` 登录 → **不能**访问 users 页面
3. 使用 `admin` 登录 → 可以访问 users 页面

---

## 💡 经验总结

### 1. react-oidc-context 的存储机制
- 使用 `oidc-client-ts` 的内部存储机制
- key 格式：`oidc.user:{authority}:{clientId}`
- **不要**直接访问 storage，使用库提供的 API

### 2. UserManager 的正确使用
- `UserManager` 与 `AuthProvider` 共享 storage
- `getUser()` 方法从 storage 恢复用户信息
- 支持自动 token 刷新

### 3. Spring Security 6 的变化
- 多个 Servlet 时需要明确路径匹配器
- 使用 `AntPathRequestMatcher` 替代字符串
- URL 级别授权 vs 方法级别授权的优先级

### 4. 配置管理的最佳实践
- 使用环境变量管理敏感配置
- 区分 `.env`（不提交）和 `.env.example`（提交）
- 统一配置模块，避免分散

### 5. Keycloak Realm 导出
- 支持完整配置导出为 JSON
- 可以一键导入到新的 Keycloak 实例
- 便于团队协作和环境迁移

---

## 🔑 Keycloak Roles 配置问题与解决

### 问题描述

前端代码中使用 `auth.user?.profile?.roles` 读取用户角色，但 Keycloak 默认的 JWT 结构中，角色信息在 `realm_access.roles` 数组中，导致前端无法正确读取角色。

### 问题根源

**Keycloak 默认 JWT 结构**:
```json
{
  "realm_access": {
    "roles": ["user", "admin"]
  },
  "resource_access": {
    "account": {
      "roles": ["manage-account"]
    }
  }
}
```

**前端期望的结构**:
```typescript
auth.user.profile.roles // 期望是 ["user", "admin"]
```

**原因**: Keycloak 的 realm-roles mapper 默认只将角色添加到 Access Token 的 `realm_access.roles`，而 `react-oidc-context` 的 `auth.user.profile` 是从 ID Token 解析的。

### 解决方案

在 Keycloak Admin Console 中配置 Roles Mapper，将角色映射到 ID Token 的顶层 `roles` 字段。

**配置步骤**:

1. 登录 Keycloak Admin Console: http://localhost:8080/admin
2. 选择 `demo-realm`
3. 左侧菜单 → **Client scopes**
4. 点击 **roles** (Client Scope)
5. 点击 **realm-roles** (Mapper)
6. 配置:
   - **ID Token Claim**: `ON` ✅
   - **Access Token Claim**: `ON` ✅
   - **Claim name**: `roles`
   - **Multivalued**: `ON` ✅
7. 点击 **Save**

**配置后的 JWT 结构**:
```json
{
  "preferred_username": "testuser",
  "email": "testuser@example.com",
  "roles": ["user"],              // ← 顶层 roles 字段
  "realm_access": {
    "roles": ["user"]
  }
}
```

### 验证方法

**方法 1: 前端 Console**
```javascript
const user = JSON.parse(sessionStorage.getItem('oidc.user:...'));
console.log('Roles:', user.profile?.roles);
// 输出：["user"] 或 ["admin"]
```

**方法 2: 前端页面**
访问 HomePage，查看用户信息中的 Roles 字段是否正常显示。

**方法 3: JWT 解码**
访问 https://jwt.io，粘贴 ID Token，查看 payload 中是否有顶层的 `roles` 字段。

### 代码中的正确使用

**前端 (TypeScript)**:
```typescript
// ✅ 正确 - 从 profile.roles 读取
const roles = auth.user?.profile?.roles;

// ✅ 正确 - 权限判断
{auth.user?.profile?.roles?.includes('admin') && (
  <Link to="/users">Users</Link>
)}
```

**后端 (Java)**:
```java
// SecurityConfig.java - 配置 JWT 角色 claim 名称
grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");

// 自动映射到 Spring Security 的 Role
@PreAuthorize("hasRole('admin')")
```

### 注意事项

1. **修改后需要重新登录** - 旧的 token 不包含新的 roles 字段
2. **同时保持 Access Token 中的 roles** - 后端 API 验证需要
3. **Claim name 必须一致** - 前后端都使用 `roles`
4. **Multivalued 必须开启** - 角色是数组格式

---

**相关文档**:
- [keycloak/README.md](./keycloak/README.md#token-mapper-配置) - Keycloak 详细配置
- [roadmap.md](./roadmap.md#token-mapper-配置) - Token Mapper 配置说明

---

## 📚 相关文档

- [roadmap.md](./roadmap.md) - 完整项目规划
- [stage-record-01.md](./stage-record-01.md) - 第一阶段记录
- [QUICKSTART.md](./QUICKSTART.md) - 快速启动指南
- [keycloak/README.md](./keycloak/README.md) - Keycloak 使用文档
- [Web-and-Http.md](./Web-and-Http.md) - Spring Security 技术笔记

---

## ✅ 阶段成果

### 完成情况
- [x] Token Introspection 功能正常
- [x] API 请求自动携带 Authorization 头
- [x] 配置统一管理（.env 文件）
- [x] Keycloak 可复用配置创建
- [x] 完整的测试验证
- [x] 文档更新

### 代码质量
- ✅ 无硬编码配置
- ✅ 支持环境变量
- ✅ 符合最佳实践
- ✅ 易于维护和扩展

### 文档完善度
- ✅ 快速启动指南
- ✅ 配置说明文档
- ✅ 故障排查指南
- ✅ 技术笔记

---

## 🚀 下一步（可选优化）

1. **测试**
   - [ ] 添加单元测试（Jest + React Testing Library）
   - [ ] 添加 E2E 测试（Playwright/Cypress）
   - [ ] 后端集成测试

2. **部署**
   - [ ] Docker 化前端和后端
   - [ ] Docker Compose 一键启动所有服务
   - [ ] CI/CD 集成

3. **功能增强**
   - [ ] Token 自动刷新 UI 提示
   - [ ] 离线模式支持
   - [ ] 更多业务功能示例

4. **生产环境**
   - [ ] HTTPS 配置
   - [ ] PostgreSQL 数据库
   - [ ] 日志收集
   - [ ] 监控告警

---

**记录时间**: 2026-02-25  
**阶段状态**: ✅ 完成  
**项目状态**: ✅ 前后端联调成功，配置优化完成
