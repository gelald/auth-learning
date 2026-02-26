# Keycloak Configuration

本目录包含 Keycloak 22 的 Docker Compose 配置和 Realm 导出文件。

## 📁 文件结构

```
keycloak/
├── docker-compose.yml          # Docker Compose 配置
├── realm-config/
│   └── demo-realm.json        # Realm 导出文件（包含所有配置）
└── README.md                   # 本文档
```

## 🚀 快速启动

### 1. 启动 Keycloak

```bash
cd keycloak
docker-compose up -d
```

**首次启动需要 30-60 秒**，Realm 会自动导入。

### 2. 验证启动

```bash
# 查看日志
docker-compose logs -f

# 检查健康状态
curl http://localhost:8080/health/ready
```

### 3. 访问 Keycloak

- **Admin Console**: http://localhost:8080/admin
  - Username: `admin`
  - Password: `admin`

- **Realm**: `demo-realm`

---

## 🔧 配置说明

### 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| Keycloak HTTP | 8080 | Keycloak 服务端口 |

**注意**: 项目中使用的 Keycloak 端口是 `8080`，请确保前端的 `.env` 文件中 `VITE_KEYCLOAK_URL` 配置正确。

### 管理员账号

- **Username**: `admin`
- **Password**: `admin`

**生产环境务必修改密码！**

---

## 📋 Realm 配置详情

### Realm 信息

- **Realm Name**: `demo-realm`
- **Display Name**: `OIDC Demo Realm`
- **Enabled**: `true`

### Token 配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Access Token Lifespan | 5m | Access Token 有效期 |
| Access Code Lifespan | 60s | Authorization Code 有效期 |
| Refresh Token | 启用 | 支持刷新 Token |

### 客户端配置

#### 1. demo-frontend（前端应用）

| 配置项 | 值 |
|--------|-----|
| Client ID | `demo-frontend` |
| Access Type | `public` |
| Standard Flow | `ON` |
| PKCE | `S256` |
| Valid Redirect URIs | `http://localhost:3000/*` |
| Web Origins | `+` |

#### 2. demo-backend（后端应用）

| 配置项 | 值 |
|--------|-----|
| Client ID | `demo-backend` |
| Access Type | `confidential` |
| Service Accounts | `ON` |
| Client Secret | `${KEYCLOAK_BACKEND_CLIENT_SECRET}` |
| Valid Redirect URIs | `http://localhost:21301/*` |
| Web Origins | `+` |

**注意**: `demo-backend` 的 Client Secret 使用了环境变量占位符，实际使用时需要：
1. 在 Keycloak Admin Console 中查看实际 secret
2. 或修改 JSON 文件中的 secret 值

### 角色配置

#### Realm Roles

| 角色名 | 说明 | 复合角色 |
|--------|------|---------|
| `user` | 普通用户 | 否 |
| `admin` | 管理员 | 是（包含 user） |

### 用户配置

#### 测试用户 (testuser)

| 配置项 | 值 |
|--------|-----|
| Username | `testuser` |
| Email | `testuser@example.com` |
| First Name | `Test` |
| Last Name | `User` |
| Password | `testpass` |
| Temporary | `false` |
| Roles | `user` |

#### 管理员用户 (admin)

| 配置项 | 值 |
|--------|-----|
| Username | `admin` |
| Email | `admin@example.com` |
| First Name | `Admin` |
| Last Name | `User` |
| Password | `adminpass` |
| Temporary | `false` |
| Roles | `admin` |

### Token Mapper 配置

#### realm-roles Mapper（关键配置）

将用户的 Realm 角色映射到 Token 的 `roles` claim（**同时添加到 ID Token 和 Access Token**）：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Mapper Type | `User Realm Role` | 映射 Realm 角色 |
| **Token Claim Name** | `roles` | Claim 字段名称，关键：业务代码使用时字段要对应 |
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
2. **后端需要**: Spring Security 从 Access Token 的 `roles` claim 读取权限，配置 `setAuthoritiesClaimName("roles")`
3. **同时保留**: `realm_access.roles` 保持 Keycloak 标准结构，兼容其他工具

**常见问题**:

**Q: 前端读取不到 roles？**  
A: 检查是否启用了 **ID Token Claim**，修改后需要重新登录才能生效。

**Q: 后端权限验证失败？**  
A: 检查 **Access Token Claim** 是否启用，以及 Claim name 是否为 `roles`。

**Q: 需要区分 Realm 角色和 Client 角色？**  
A: Realm 角色使用 `realm-roles` mapper，Client 角色需要额外添加 `client-roles` mapper。

#### audience resolve Mapper

自动解析客户端 audience，不需要额外配置。

---

## 🔄 导入/导出 Realm

### 从 Admin Console 导出

1. 登录 Keycloak Admin Console
2. 选择 `demo-realm`
3. 点击左侧 **Realm settings**
4. 点击 **Partial export** 或 **Full export**
5. 保存 JSON 文件到 `realm-config/` 目录

### 导入自定义 Realm

1. 修改 `realm-config/demo-realm.json`
2. 重启 Keycloak：
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### 手动创建 Realm（替代方案）

如果不想使用导入文件，可以手动创建：

1. 登录 Admin Console
2. 左上角选择 **master** → **Create Realm**
3. 按照向导配置：
   - Realm name: `demo-realm`
   - 创建客户端 `demo-frontend` 和 `demo-backend`
   - 创建角色 `user` 和 `admin`
   - 创建用户 `testuser` 和 `admin`

---

## 🗄️ 数据库配置

### 默认配置（H2 内存数据库）

当前配置使用 Keycloak 内嵌的 H2 内存数据库，**数据不会持久化**。

### 生产环境配置（PostgreSQL）

取消 `docker-compose.yml` 中 PostgreSQL 服务的注释：

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
```

---

## 🔐 安全配置

### 修改 Client Secret

`demo-backend` 的 Client Secret 在导入后会由 Keycloak 自动生成。获取方法：

1. 登录 Admin Console
2. 选择 `demo-realm`
3. 左侧菜单 **Clients** → **demo-backend**
4. 点击 **Credentials** 标签
5. 复制 **Client secret**
6. 更新到 `backend/src/main/resources/application.yml`

### 修改管理员密码

**生产环境必须修改！**

1. 登录 Admin Console
2. 左侧菜单 **Realm settings** → **Security**
3. 或修改 `docker-compose.yml` 中的环境变量：
   ```yaml
   environment:
     KEYCLOAK_ADMIN: your-admin-name
     KEYCLOAK_ADMIN_PASSWORD: your-secure-password
   ```

### HTTPS 配置

开发环境使用 HTTP，生产环境必须配置 HTTPS：

```yaml
environment:
  KC_HTTPS_CERTIFICATE_FILE: /etc/x509/https/tls.crt
  KC_HTTPS_CERTIFICATE_KEY_FILE: /etc/x509/https/tls.key
```

---

## 🛠️ 故障排查

### Keycloak 启动失败

```bash
# 查看日志
docker-compose logs keycloak

# 重启
docker-compose restart

# 完全重建
docker-compose down -v
docker-compose up -d
```

### Realm 导入失败

检查日志中是否有：
```
Importing realm from file: /opt/keycloak/data/import/demo-realm.json
```

如果没有，检查 `docker-compose.yml` 中的 volumes 配置。

### 端口冲突

如果 8080 端口被占用，修改 `docker-compose.yml`：

```yaml
ports:
  - "8081:8080"  # 主机端口：容器端口
```

---

## 📝 环境变量说明

### docker-compose.yml 中的环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `KEYCLOAK_ADMIN` | `admin` | 管理员用户名 |
| `KEYCLOAK_ADMIN_PASSWORD` | `admin` | 管理员密码 |
| `KC_HTTP_ENABLED` | `true` | 启用 HTTP（开发环境） |
| `KC_HOSTNAME_STRICT` | `false` | 不严格检查 hostname |

### .env 文件（项目根目录）

可以创建 `.env` 文件统一管理：

```bash
# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_BACKEND_CLIENT_SECRET=your-secret-here

# 使用时在 docker-compose.yml 中引用
# secret: ${KEYCLOAK_BACKEND_CLIENT_SECRET}
```

---

## 🔗 相关链接

- [Keycloak 官方文档](https://www.keycloak.org/documentation)
- [Keycloak Docker 镜像](https://quay.io/repository/keycloak/keycloak)
- [Keycloak Import/Export](https://www.keycloak.org/docs/latest/server_admin/index.html#_export_import)

---

**记录时间**: 2026-02-25  
**Keycloak 版本**: 22.0.5
