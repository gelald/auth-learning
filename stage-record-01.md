# Stage Record 01 - 项目启动与后端搭建

## 🎯 项目目标

搭建完整的 OIDC 认证 Demo，包含：
- **前端**: React + react-oidc-context
- **后端**: SpringBoot 3.1 + Spring Security
- **认证服务**: Keycloak 22 (Docker Compose 部署)
- **核心功能**: PKCE 认证流程 + Token Introspection 实时校验

---

## 📝 已完成的工作

### 1. 项目文档 (`roadmap.md`)
创建了完整的项目规划文档，包含：
- 技术栈说明
- 项目架构图
- 6 个实施阶段
- Keycloak 配置要点
- 端口配置（前端 3000 / 后端 21301 / Keycloak 8081）

### 2. 后端项目搭建 ✅

**已创建的文件结构：**
```
backend/
├── pom.xml                              # Maven 配置 (SpringBoot 3.1.5, Java 17)
├── src/main/resources/application.yml   # 应用配置
├── src/main/java/com/example/demo/
│   ├── DemoBackendApplication.java      # 启动类
│   ├── config/
│   │   ├── SecurityConfig.java          # JWT 验证、RBAC、CORS 配置
│   │   └── DataInitializer.java         # 初始化 5 个示例产品
│   ├── controller/
│   │   ├── PublicController.java        # 公开端点 (/api/public/**)
│   │   ├── UserController.java          # 用户管理 API
│   │   ├── ProductController.java       # 产品 CRUD API
│   │   └── IntrospectionController.java # Token 实时校验端点
│   ├── dto/                             # 数据传输对象
│   ├── entity/                          # JPA 实体 (User, Product)
│   ├── repository/                      # 数据访问层
│   └── service/                         # 业务逻辑层
├── README.md                            # 后端文档
└── .gitignore
```

**核心功能：**
| 功能 | 说明 |
|------|------|
| JWT 验证 | 通过 Keycloak JWKS 端点验证 token |
| RBAC | 基于角色的访问控制 (user/admin) |
| 产品 CRUD | 完整的增删改查 API |
| Token Introspection | 调用 Keycloak API 实时校验 token |
| CORS | 允许前端跨域访问 |
| 示例数据 | 启动时自动创建 5 个产品 |

**API 端点清单：**

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| /api/public/health | GET | 公开 | 健康检查 |
| /api/public/info | GET | 公开 | API 信息 |
| /api/users/current | GET | 认证 | 获取当前用户 |
| /api/users/{id} | GET | admin | 获取用户详情 |
| /api/users | GET | admin | 获取所有用户 |
| /api/users/{id} | PUT | admin | 更新用户 |
| /api/users/{id} | DELETE | admin | 删除用户 |
| /api/products | GET | 公开 | 获取所有产品 |
| /api/products/{id} | GET | 公开 | 获取产品详情 |
| /api/products/category/{category} | GET | 公开 | 按类别查询 |
| /api/products/search | GET | 公开 | 搜索产品 |
| /api/products | POST | user/admin | 创建产品 |
| /api/products/{id} | PUT | user/admin | 更新产品 |
| /api/products/{id} | DELETE | user/admin | 删除产品 |
| /api/products/{id}/quantity | PATCH | user/admin | 更新库存 |
| /api/introspect | POST | 认证 | Token 实时校验 |

### 3. React 前端搭建 ✅

**已创建的文件结构：**
```
frontend/
├── src/
│   ├── config/
│   │   └── oidc.ts                    # OIDC 配置
│   ├── services/
│   │   └── index.ts                   # API 服务 (Products, Users, Introspection)
│   ├── components/
│   │   └── Layout.tsx                 # 主布局（导航、登录/登出）
│   ├── pages/
│   │   ├── HomePage.tsx               # 首页
│   │   ├── ProductsPage.tsx           # 产品 CRUD 页面
│   │   ├── UsersPage.tsx              # 用户管理页面（admin）
│   │   └── CallbackPage.tsx           # OIDC 回调处理
│   ├── styles/
│   │   └── index.css                  # 全局样式
│   ├── App.tsx                        # 主应用组件
│   └── main.tsx                       # 入口文件
├── package.json
├── vite.config.ts                     # Vite 配置（含 API 代理）
├── tsconfig.json
└── README.md
```

**核心功能：**
| 功能 | 说明 |
|------|------|
| PKCE 认证 | 使用 react-oidc-context 自动处理 |
| 路由保护 | 基于认证状态的路由守卫 |
| 产品 CRUD | 完整的增删改查界面 |
| 用户管理 | Admin 专属功能 |
| Token 校验 | 调用 introspection API |
| API 代理 | Vite 开发服务器代理到后端 (21301) |

**页面清单：**

| 页面 | 路径 | 权限 | 说明 |
|------|------|------|------|
| 首页 | `/` | 公开 | 欢迎页面 + 用户信息 |
| 产品列表 | `/products` | 认证 | 产品 CRUD 操作 |
| 用户管理 | `/users` | admin | 用户列表 + 删除 |
| 回调处理 | `/callback` | - | OIDC 认证回调 |

---

## ⚠️ Keycloak 配置检查清单

### Realm 配置
- [ ] Realm 名称：`demo-realm`
- [ ] Realm 启用：是

### 前端客户端 (demo-frontend)
- [ ] Client ID: `demo-frontend`
- [ ] Client Type: OpenID Connect
- [ ] Access Type: `public`
- [ ] Standard Flow: `ON`
- [ ] Authorization Flow: `PKCE` (自动启用)
- [ ] Direct Access Grants: `OFF`
- [ ] Valid Redirect URIs: `http://localhost:3000/*`
- [ ] Web Origins: `+`
- [ ] Admin URL: (留空)
- [ ] Home URL: `http://localhost:3000`

### 后端客户端 (demo-backend)
- [ ] Client ID: `demo-backend`
- [ ] Client Type: OpenID Connect
- [ ] Access Type: `confidential`
- [ ] Standard Flow: `ON`
- [ ] Service Accounts Enabled: `ON`
- [ ] Direct Access Grants: `OFF`
- [ ] Valid Redirect URIs: `http://localhost:21301/*`
- [ ] Web Origins: `+`
- [ ] Admin URL: `http://localhost:21301`
- [ ] **Client Secret**: 复制并保存到 `backend/src/main/resources/application.yml`

### Realm Roles
- [ ] 创建角色 `user`
- [ ] 创建角色 `admin`

### 测试用户

**普通用户 (testuser)**
- [ ] Username: `testuser`
- [ ] Email: `testuser@example.com`
- [ ] First Name: `Test`
- [ ] Last Name: `User`
- [ ] Password: `testpass` (Temporary: `OFF`)
- [ ] Realm Roles: `user`

**管理员 (admin)**
- [ ] Username: `admin`
- [ ] Email: `admin@example.com`
- [ ] First Name: `Admin`
- [ ] Last Name: `User`
- [ ] Password: `adminpass` (Temporary: `OFF`)
- [ ] Realm Roles: `admin`

### Token 配置
- [ ] Access Token Lifespan: `5m` (默认)
- [ ] Client Session Idle: `30m`
- [ ] Client Session Max: `10h`

### Mappers 配置 (可选 - 用于在 token 中添加角色)
- [ ] 创建 Mapper: `realm-roles`
  - Mapper Type: `User Realm Role`
  - Token Claim Name: `roles`
  - Claim JSON Type: `String`
  - Multivalued: `ON`
  - Add to ID token: `ON`
  - Add to access token: `ON`

---

## 📌 配置文件修改

### 后端 application.yml

在 `backend/src/main/resources/application.yml` 中替换：

```yaml
keycloak:
  server-url: http://localhost:8081
  realm: demo-realm
  resource: demo-backend
  credentials:
    secret: YOUR_BACKEND_CLIENT_SECRET  # ⚠️ 替换为 Keycloak 中的实际 secret
  cors: true
```

### 前端 OIDC 配置

在 `frontend/src/config/oidc.ts` 中确认配置：

```typescript
export const oidcConfig = {
  authority: 'http://localhost:8081/realms/demo-realm',
  client_id: 'demo-frontend',
  redirect_uri: window.location.origin,  // http://localhost:3000
  post_logout_redirect_uri: window.location.origin,
  scope: 'openid profile email',
  automaticSilentRenew: true,
  validateSubOnSilentRenew: true,
};
```

---

## 📌 技术栈版本

### 后端
- Java: 17
- SpringBoot: 3.1.5
- Spring Security: 6.1.5
- Keycloak Adapter: 22.0.5
- 数据库：H2 (内存)

### 前端
- React: 18.2.0
- TypeScript: 5.2.2
- react-oidc-context: 2.3.1
- react-router-dom: 6.20.1
- axios: 1.6.2
- Vite: 5.0.8

### 认证服务
- Keycloak: 22.0.5
- 部署方式：Docker Compose

---

## 📌 端口配置

| 服务 | 端口 | 访问地址 |
|------|------|----------|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 21301 | http://localhost:21301 |
| Keycloak | 8081 | http://localhost:8081 |
| H2 Console | 21301 | http://localhost:21301/h2-console |

---

## 📌 数据库访问

### H2 控制台
- 访问地址：http://localhost:21301/h2-console
- JDBC URL: `jdbc:h2:mem:demo`
- 用户名：`sa`
- 密码：`password`

### 安全配置说明

**WebSecurity vs HttpSecurity**:
- `WebSecurityCustomizer` - 完全忽略 `/h2-console/**`, `/favicon.ico`, `/error`
- `SecurityFilterChain` - 配置 API 端点的 JWT 认证

详细笔记见：`Web-and-Http.md`

---

## 🚀 启动顺序

1. **启动 Keycloak**
   ```bash
   cd keycloak
   docker-compose up -d
   ```

2. **启动 Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **启动 Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

快速启动指南见：`QUICKSTART.md`

---

## 记录时间
2026-02-25

## 更新记录
- 2026-02-25: 初始创建
- 2026-02-25: 添加前端搭建完成内容
- 2026-02-25: 添加完整的 Keycloak 配置检查清单
- 2026-02-25: 添加 Keycloak Docker Compose 和 Realm 配置
- 2026-02-25: 添加配置统一管理方案

---

## 📦 Keycloak 配置归档

### 位置
`/keycloak/` 目录

### 文件清单
- `docker-compose.yml` - Keycloak 22 Docker 配置
- `realm-config/demo-realm.json` - Realm 导出文件（含所有配置）
- `realm-config/CLIENT_SECRET.md` - Client Secret 获取说明
- `README.md` - 详细使用文档

### 快速启动 Keycloak
```bash
cd keycloak
docker-compose up -d
```

**等待 30-60 秒**，Realm 会自动导入，包含：
- ✅ Realm: `demo-realm`
- ✅ 客户端：`demo-frontend`, `demo-backend`
- ✅ 角色：`user`, `admin`
- ✅ 用户：`testuser/testpass`, `admin/adminpass`

### 获取 Backend Client Secret
1. 访问 http://localhost:8080/admin
2. 登录：`admin` / `admin`
3. 选择 `demo-realm`
4. Clients → `demo-backend` → Credentials
5. 复制 Client secret 到 `backend/application.yml`

详见：`keycloak/README.md`
