# OIDC Demo - React + SpringBoot + Keycloak

一个完整的 OpenID Connect (OIDC) 认证示例项目，展示如何实现 PKCE 认证流程和 Token 实时校验。

## 🎯 项目简介

本项目提供了一个生产级的 OIDC 认证完整示例，包含：

- ✅ **前端**: React 18 + TypeScript + react-oidc-context
- ✅ **后端**: SpringBoot 3.1 + Spring Security 6
- ✅ **认证**: Keycloak 22 (OIDC Provider)
- ✅ **数据库**: H2 (开发) / PostgreSQL (生产)

## 📊 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React 18 + TypeScript | 18.2.0 |
| 前端认证 | react-oidc-context | 2.4.0 |
| OIDC 客户端 | oidc-client-ts | 2.4.0 |
| 路由 | react-router-dom | 6.20.1 |
| HTTP 客户端 | axios | 1.6.2 |
| 构建工具 | Vite | 5.0.8 |
| 后端框架 | SpringBoot 3.1 + Spring Security 6 | 3.1.5 |
| OIDC 提供商 | Keycloak 22 | 22.0.5 |
| 容器化 | Docker Compose | 3.8 |
| 数据库 | H2 (开发) / PostgreSQL (生产) | - |
| Java | - | 17 |

## 🚀 快速启动

### 前置条件

- Docker & Docker Compose
- Java 17+
- Node.js 18+ & npm

### 一键启动

```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

### 手动启动

```bash
# 1. 启动 Keycloak
cd keycloak
docker-compose up -d
# 等待 30-60 秒

# 2. 启动后端 (新终端)
cd backend
mvn spring-boot:run

# 3. 启动前端 (新终端)
cd frontend
npm run dev
```

### 访问应用

| 服务 | 地址 | 说明 |
|------|------|------|
| 🌐 前端 | http://localhost:3000 | React 应用 |
| 🔧 后端 API | http://localhost:21301 | SpringBoot API |
| 🔑 Keycloak | http://localhost:8080 | 认证服务 |
| 💾 H2 Console | http://localhost:21301/h2-console | 数据库控制台 |

### 测试账号

| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| `testuser` | `testpass` | `user` | 产品 CRUD |
| `admin` | `adminpass` | `admin` | 所有权限 + 用户管理 |

## 📋 核心功能

### 🔐 认证功能
- ✅ PKCE (Proof Key for Code Exchange) 认证流程
- ✅ 自动 Token 刷新（Silent Renew）
- ✅ Token Introspection 实时校验
- ✅ 基于角色的访问控制（RBAC）
- ✅ JWT 令牌验证（JWKS）

### 📦 业务功能
- ✅ 产品管理（CRUD）
- ✅ 用户管理（Admin 专属）
- ✅ 权限控制示例
- ✅ 示例数据初始化

### 🛠️ 技术特性
- ✅ JWT 令牌验证（JWKS）
- ✅ CORS 跨域配置
- ✅ 环境变量管理
- ✅ 一键部署配置
- ✅ H2 控制台安全隔离

## 🏗️ 项目架构

```
auth-learning/
├── keycloak/              # Keycloak 配置
│   ├── docker-compose.yml # Docker 部署
│   ├── realm-config/      # Realm 导出
│   │   ├── demo-realm.json
│   │   └── CLIENT_SECRET.md
│   └── README.md          # 使用文档
├── frontend/              # React 前端
│   ├── .env               # 环境变量配置
│   ├── .env.example       # 环境变量模板
│   ├── vite.config.ts     # Vite 配置
│   └── src/
│       ├── config/        # 统一配置管理
│       ├── services/      # API 服务层
│       ├── components/    # React 组件
│       ├── pages/         # 页面组件
│       └── styles/        # 全局样式
├── backend/               # SpringBoot 后端
│   ├── src/main/
│   │   ├── java/.../      # Java 源码
│   │   │   ├── config/    # 安全配置
│   │   │   ├── controller/# API 控制器
│   │   │   ├── service/   # 业务逻辑
│   │   │   ├── repository/# 数据访问
│   │   │   └── entity/    # JPA 实体
│   │   └── resources/
│   │       └── application.yml  # 后端配置
│   └── pom.xml            # Maven 配置
├── start.sh / start.bat   # 快速启动脚本
└── 文档/
    ├── roadmap.md         # 项目规划
    ├── stage-record-*.md  # 阶段记录
    └── QUICKSTART.md      # 快速指南
```

## 🔧 配置说明

### 前端配置 (.env)

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

### 后端配置 (application.yml)

```yaml
server:
  port: 21301

spring:
  datasource:
    url: jdbc:h2:mem:demo
    driver-class-name: org.h2.Driver
    username: sa
    password: password

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

  h2:
    console:
      enabled: true
      path: /h2-console

keycloak:
  server-url: http://localhost:8080
  realm: demo-realm
  client-id: demo-backend
  client-secret: YOUR_CLIENT_SECRET  # ⚠️ 替换为实际值

logging:
  level:
    com.example.demo: DEBUG
    org.springframework.security: DEBUG
```

### 端口配置

| 服务 | 端口 | 访问地址 | 说明 |
|------|------|----------|------|
| 前端 | 3000 | http://localhost:3000 | React + Vite |
| 后端 | 21301 | http://localhost:21301 | SpringBoot |
| Keycloak | 8080 | http://localhost:8080 | Keycloak 22 |
| H2 Console | 21301 | http://localhost:21301/h2-console | 后端数据库 |

**注意**: 所有端口配置在前端 `.env` 文件和后端 `application.yml` 中统一管理

## 📖 主要 API 端点

### 公开端点（无需认证）
| 端点 | 方法 | 说明 |
|------|------|------|
| /api/public/health | GET | 健康检查 |
| /api/public/info | GET | API 信息 |

### 产品端点（需要认证）
| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| /api/products | GET | 认证 | 获取所有产品 |
| /api/products/{id} | GET | 认证 | 获取产品详情 |
| /api/products/category/{category} | GET | 认证 | 按类别查询 |
| /api/products/search | GET | 认证 | 搜索产品 |
| /api/products | POST | user/admin | 创建产品 |
| /api/products/{id} | PUT | user/admin | 更新产品 |
| /api/products/{id} | DELETE | user/admin | 删除产品 |
| /api/products/{id}/quantity | PATCH | user/admin | 更新库存 |

### 用户端点（需要认证）
| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| /api/users/current | GET | 认证 | 获取当前用户 |
| /api/users | GET | admin | 获取所有用户 |
| /api/users/{id} | GET | admin | 获取用户详情 |
| /api/users/{id} | PUT | admin | 更新用户 |
| /api/users/{id} | DELETE | admin | 删除用户 |

### Token 校验
| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| /api/introspect | POST | 认证 | Token 实时校验 |
| /api/introspect/health | GET | 公开 | 健康检查 |

## 🔐 安全特性

| 特性 | 说明 |
|------|------|
| **PKCE** | 防止 Authorization Code 拦截攻击 |
| **JWT 验证** | 通过 JWKS 端点验证 Token 签名 |
| **Token Introspection** | 实时校验 Token 有效性 |
| **RBAC** | 基于角色的细粒度权限控制 |
| **CORS** | 跨域请求安全控制 |
| **环境变量** | 敏感配置不硬编码 |
| **H2 隔离** | WebSecurityCustomizer 完全绕过 H2 控制台 |

## 🔑 Keycloak 配置要点

### Realm 配置
- **Realm Name**: `demo-realm`
- **Token 有效期**: 5 分钟
- **PKCE**: S256

### 前端客户端配置
| 配置项 | 值 |
|--------|-----|
| Client ID | `demo-frontend` |
| Access Type | `public` |
| Standard Flow | `ON` |
| Direct Access Grants | `OFF` |
| PKCE | `S256` (自动启用) |
| Valid Redirect URIs | `http://localhost:3000/*` |
| Web Origins | `+` |

### 后端客户端配置
| 配置项 | 值 |
|--------|-----|
| Client ID | `demo-backend` |
| Access Type | `confidential` |
| Service Accounts | `ON` |
| Valid Redirect URIs | `http://localhost:21301/*` |
| Web Origins | `+` |
| Client Secret | 从 Admin Console 获取 |

### Token Mapper 配置（关键）

将用户的 Realm 角色映射到 Token 的 `roles` claim（**同时添加到 ID Token 和 Access Token**）：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Mapper Type | `User Realm Role` | 映射 Realm 角色 |
| Token Claim Name | `roles` | Claim 字段名称 |
| Claim JSON Type | `String` | JSON 类型 |
| **ID Token Claim** | `ON` ✅ | **关键：添加到 ID Token** |
| **Access Token Claim** | `ON` ✅ | **关键：添加到 Access Token** |
| **Multivalued** | `ON` ✅ | **关键：角色是数组** |

**配置路径**:
```
Keycloak Admin Console
  → demo-realm
  → Client scopes
  → roles (Client Scope)
  → realm-roles (Mapper)
  → Edit
```

**配置后的 Token 结构**:
```json
{
  "preferred_username": "testuser",
  "email": "testuser@example.com",
  "roles": ["user"],              // ← 顶层 roles 字段（前端使用）
  "realm_access": {
    "roles": ["user"]             // ← Keycloak 默认结构（保留）
  }
}
```

**为什么需要这样配置？**

1. **前端需要**: `react-oidc-context` 从 ID Token 解析用户信息，`auth.user.profile.roles` 直接读取
2. **后端需要**: Spring Security 从 Access Token 的 `roles` claim 读取权限
3. **同时保留**: `realm_access.roles` 保持 Keycloak 标准结构

详见：[stage-record-02.md](./stage-record-02.md#keycloak-roles-配置问题与解决)

## 📚 文档导航

### 📖 核心文档

| 文档 | 目标读者 | 内容 | 必读 |
|------|---------|------|------|
| [📋 项目规划](./roadmap.md) | 所有开发者 | 技术架构、API 清单、配置说明、项目进度 | ⭐⭐⭐ |
| [🚀 快速启动](./QUICKSTART.md) | 新用户 | 详细的启动步骤、测试流程、常见问题 | ⭐⭐⭐ |
| [📝 阶段记录 01](./stage-record-01.md) | 开发者 | 项目启动、后端搭建、Keycloak 配置清单 | ⭐⭐ |
| [📝 阶段记录 02](./stage-record-02.md) | 开发者 | 前后端联调、问题排查、配置优化、**Roles 配置** | ⭐⭐ |

### 🔧 模块文档

| 文档 | 说明 | 适用场景 |
|------|------|---------|
| [🔑 Keycloak 文档](./keycloak/README.md) | Keycloak 部署、配置、故障排查 | 需要修改 Keycloak 配置时 |
| [💻 前端文档](./frontend/README.md) | React 前端开发指南 | 前端功能开发 |
| [⚙️ 后端文档](./backend/README.md) | SpringBoot 后端开发指南 | 后端 API 开发 |

### 📝 技术笔记

| 文档 | 主题 | 内容 |
|------|------|------|
| [WebSecurity vs HttpSecurity](./Web-and-Http.md) | Spring Security | 详细对比、使用场景、最佳实践 |

### 🗂️ 完整文档清单

```
auth-learning/
├── README.md                     # 📖 项目总览（本文档）
├── roadmap.md                    # 📋 项目规划与技术栈
├── QUICKSTART.md                 # 🚀 快速启动指南（5 分钟上手）
├── stage-record-01.md            # 📝 第一阶段：后端搭建
├── stage-record-02.md            # 📝 第二阶段：联调与优化（含 Roles 配置）
├── Web-and-Http.md               # 💡 Spring Security 技术笔记
├── start.sh / start.bat          # 🔧 快速启动脚本
├── frontend/
│   ├── README.md                 # 前端开发文档
│   ├── .env.example              # 环境变量模板
│   └── src/config/index.ts       # 前端统一配置
├── backend/
│   ├── README.md                 # 后端开发文档
│   └── src/main/resources/
│       └── application.yml       # 后端配置文件
└── keycloak/
    ├── README.md                 # Keycloak 使用文档
    ├── docker-compose.yml        # Docker 部署配置
    └── realm-config/
        ├── demo-realm.json       # Realm 导出文件
        └── CLIENT_SECRET.md      # Client Secret 说明
```

### 🎯 使用场景推荐

**第一次使用这个项目？**
1. 阅读 [README.md](./README.md)（本文档）了解项目概况
2. 按照 [QUICKSTART.md](./QUICKSTART.md) 快速启动
3. 遇到问题查看 [stage-record-02.md](./stage-record-02.md) 的故障排查

**需要修改认证配置？**
1. 查看 [roadmap.md](./roadmap.md) 的配置说明
2. 参考 [keycloak/README.md](./keycloak/README.md) 的 Keycloak 配置
3. 如果遇到 Roles 相关问题，查看 [stage-record-02.md](./stage-record-02.md#keycloak-roles-配置问题与解决)

**学习 Spring Security？**
- 阅读 [Web-and-Http.md](./Web-and-Http.md) 深入了解 WebSecurity vs HttpSecurity

**需要开发新功能？**
- 前端：参考 [frontend/README.md](./frontend/README.md)
- 后端：参考 [backend/README.md](./backend/README.md)

## 🛠️ 开发指南

### 修改端口配置

只需修改 `frontend/.env`：

```bash
VITE_KEYCLOAK_URL=http://localhost:8081  # 修改 Keycloak 端口
VITE_BACKEND_URL=http://localhost:21302  # 修改后端端口
VITE_FRONTEND_PORT=3001                  # 修改前端端口
```

所有配置会自动同步更新。

### 添加新用户

1. 访问 Keycloak Admin Console: http://localhost:8080/admin
2. 选择 `demo-realm`
3. 左侧菜单 **Users** → **Add user**
4. 填写用户名、邮箱、名字、姓氏
5. 点击 **Create**
6. 设置密码：Credentials → Set Password
7. 分配角色：Role mapping → Assign role

### 修改权限规则

编辑 `backend/src/main/java/com/example/demo/config/SecurityConfig.java`:

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers(new AntPathRequestMatcher("/api/admin/**")).hasRole("admin")
    .requestMatchers(new AntPathRequestMatcher("/api/user/**")).hasAnyRole("user", "admin")
    .anyRequest().authenticated()
)
```

### 获取 Backend Client Secret

1. 访问 Keycloak Admin Console: http://localhost:8080/admin
2. 登录：`admin` / `admin`
3. 选择 `demo-realm`
4. 左侧菜单 **Clients** → **demo-backend**
5. 点击 **Credentials** 标签
6. 复制 **Client secret**
7. 更新到 `backend/src/main/resources/application.yml`

详见：[keycloak/realm-config/CLIENT_SECRET.md](./keycloak/realm-config/CLIENT_SECRET.md)

## 🧪 测试流程

### 完整测试步骤

1. **启动所有服务**（见上方快速启动）

2. **测试公开访问**:
   - 访问 http://localhost:3000
   - 查看欢迎页面
   - 点击 "Login" 按钮

3. **测试认证流程**:
   - 重定向到 Keycloak 登录页
   - 输入 `testuser` / `testpass`
   - 成功登录后返回前端首页
   - 查看用户信息显示

4. **测试产品功能**:
   - 访问 http://localhost:3000/products
   - 查看产品列表（5 个示例产品）
   - 点击 "Add Product" 创建新产品
   - 编辑和删除产品

5. **测试权限控制**:
   - 使用 `testuser` 登录
   - 访问 /products ✅ 可以访问
   - 访问 /users ❌ 导航栏不显示（无权限）
   - 使用 `admin` 登录
   - 访问 /users ✅ 可以访问

6. **测试 Token Introspection**:
   - 点击导航栏的 "Check Token" 按钮
   - 查看弹窗显示 token 信息
   - 确认 `active: true`

7. **验证 API 请求**:
   - 打开浏览器开发者工具 → Network
   - 访问 /products
   - 检查请求头包含 `Authorization: Bearer <token>`

### API 测试

#### 公开端点
```bash
# 健康检查
curl http://localhost:21301/api/public/health

# 获取产品列表
curl http://localhost:21301/api/products
```

#### 受保护端点（需要 token）
```bash
# 获取当前用户
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:21301/api/users/current

# Token 校验
curl -X POST \
  -H "Authorization: Bearer <access_token>" \
  http://localhost:21301/api/introspect
```

### H2 数据库访问

访问控制台：http://localhost:21301/h2-console

**连接配置**:
- JDBC URL: `jdbc:h2:mem:demo`
- 用户名：`sa`
- 密码：`password`

**查看数据**:
```sql
SELECT * FROM products;
SELECT * FROM users;
```

## 🐛 常见问题

### 1. Keycloak 启动失败

**症状**: Docker 容器启动后立即退出

**解决方案**:
```bash
# 查看日志
cd keycloak
docker-compose logs -f

# 重启
docker-compose down
docker-compose up -d

# 检查端口占用
netstat -ano | findstr :8080
```

### 2. 后端启动失败

**症状**: Maven 编译错误或端口被占用

**解决方案**:
- 检查端口 21301 是否被占用
- 确认 Keycloak 已启动（等待 30-60 秒）
- 检查 `application.yml` 中的 client-secret 是否正确
- 确认 Java 版本为 17+

### 3. 前端无法连接后端

**症状**: API 请求返回网络错误

**解决方案**:
- 检查 Vite 代理配置 (`vite.config.ts`)
- 确认后端端口为 21301
- 清除浏览器缓存
- 检查后端是否正常启动

### 4. 401 Unauthorized

**症状**: API 请求返回 401

**解决方案**:
- 检查是否已登录
- 检查浏览器 Network 中 Authorization 头是否存在
- 查看 Keycloak realm 配置是否正确
- 检查 token 是否过期（默认 5 分钟）

### 5. CORS 错误

**症状**: 浏览器报 CORS 错误

**解决方案**:
- 确认 Keycloak 客户端的 Web Origins 配置为 `+`
- 确认后端 SecurityConfig 中的 CORS 配置
- 检查请求源是否正确

### 6. Token Introspection 失败

**症状**: Check Token 按钮返回错误

**解决方案**:
- 检查后端 `application.yml` 中的 client-secret 是否正确
- 检查网络是否可达 Keycloak 服务
- 确认 token 未过期

### 7. 读取不到用户角色 (roles)

**症状**: `auth.user.profile.roles` 为 undefined

**解决方案**:
1. 检查 Keycloak 中的 Token Mapper 配置（见上方 Token Mapper 配置）
2. 确认启用了 **ID Token Claim**
3. 修改后需要 **重新登录** 才能生效
4. 在浏览器 Console 中打印 `auth.user` 查看完整结构

详见：[stage-record-02.md](./stage-record-02.md#keycloak-roles-配置问题与解决)

### 8. 登录循环（Login Loop）

**症状**: 登录后又跳回登录页

**解决方案**:
- 检查 Keycloak 客户端的 Valid Redirect URIs 是否包含 `http://localhost:3000/*`
- 确认 Client ID 匹配 (`demo-frontend`)
- 清除浏览器缓存和 Cookie
- 检查浏览器 Console 是否有错误

## 🚀 部署到生产环境

### 1. 修改配置

```bash
# frontend/.env.production
VITE_KEYCLOAK_URL=https://auth.yourdomain.com
VITE_BACKEND_URL=https://api.yourdomain.com
```

### 2. 启用 HTTPS

```yaml
# keycloak/docker-compose.yml
environment:
  KC_HTTPS_CERTIFICATE_FILE: /etc/x509/https/tls.crt
  KC_HTTPS_CERTIFICATE_KEY_FILE: /etc/x509/https/tls.key
```

### 3. 使用 PostgreSQL（生产环境推荐）

取消 `keycloak/docker-compose.yml` 中 PostgreSQL 服务的注释：

```yaml
services:
  keycloak:
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: keycloak
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: keycloak
    volumes:
      - postgres-data:/var/lib/postgresql/data
```

### 4. 构建前端

```bash
cd frontend
npm run build
```

### 5. 打包后端

```bash
cd backend
mvn clean package
java -jar target/demo-backend-1.0.0.jar
```

## 📊 项目完成情况

### ✅ 已完成（100%）
- [x] Keycloak 环境搭建
- [x] SpringBoot 后端开发
- [x] React 前端开发
- [x] PKCE 认证流程
- [x] Token 实时校验
- [x] 测试与文档
- [x] 配置统一管理
- [x] Keycloak 可复用配置

### 🔄 待优化（可选）
- [ ] 添加单元测试（Jest + React Testing Library）
- [ ] 添加 E2E 测试（Playwright/Cypress）
- [ ] Docker 化部署（前后端容器化）
- [ ] CI/CD 集成
- [ ] 更多业务功能示例
- [ ] 生产环境配置（HTTPS + PostgreSQL）
- [ ] 集成 Swagger 文档
- [ ] 日志收集与监控

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**最后更新**: 2026-02-25  
**项目状态**: ✅ 完成  
**测试状态**: ✅ 通过
