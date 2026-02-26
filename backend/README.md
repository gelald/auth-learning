# Demo Backend - OIDC Authentication with Keycloak

SpringBoot 3.1 backend with Keycloak OAuth2/OIDC authentication and PKCE support.

## 技术栈

- Java 17
- SpringBoot 3.1.5
- Spring Security 6
- Spring Data JPA
- Keycloak 22
- H2 Database
- Maven

## 项目结构

```
src/main/java/com/example/demo/
├── config/              # 配置类
│   ├── SecurityConfig.java
│   └── DataInitializer.java
├── controller/          # REST控制器
│   ├── PublicController.java
│   ├── UserController.java
│   ├── ProductController.java
│   └── IntrospectionController.java
├── dto/                 # 数据传输对象
│   ├── UserDto.java
│   └── ProductDto.java
├── entity/              # JPA实体
│   ├── User.java
│   └── Product.java
├── repository/          # 数据仓库
│   ├── UserRepository.java
│   └── ProductRepository.java
├── service/             # 业务逻辑
│   ├── UserService.java
│   └── ProductService.java
└── DemoBackendApplication.java
```

## 配置说明

### application.yml 需要修改的地方

在 `application.yml` 中，需要将 `YOUR_BACKEND_CLIENT_SECRET` 替换为您在Keycloak中配置的后端客户端的secret。

```yaml
keycloak:
  credentials:
    secret: YOUR_BACKEND_CLIENT_SECRET  # 替换为实际的secret
```

### Keycloak配置

确保Keycloak中已配置：
- Realm: `demo-realm`
- 前端客户端ID: `demo-frontend`
- 后端客户端ID: `demo-backend`

## API端点

### 公开端点（无需认证）
- `GET /api/public/health` - 健康检查
- `GET /api/public/info` - API信息

### 用户端点
- `GET /api/users/current` - 获取当前用户信息（需要认证）
- `GET /api/users/{id}` - 根据ID获取用户（需要admin角色）
- `GET /api/users` - 获取所有用户（需要admin角色）
- `PUT /api/users/{id}` - 更新用户信息（需要admin角色）
- `DELETE /api/users/{id}` - 删除用户（需要admin角色）

### 产品端点
- `GET /api/products` - 获取所有产品（公开）
- `GET /api/products/{id}` - 根据ID获取产品（公开）
- `GET /api/products/category/{category}` - 按类别获取产品（公开）
- `GET /api/products/search?name=xxx` - 搜索产品（公开）
- `POST /api/products` - 创建产品（需要user或admin角色）
- `PUT /api/products/{id}` - 更新产品（需要user或admin角色）
- `DELETE /api/products/{id}` - 删除产品（需要user或admin角色）
- `PATCH /api/products/{id}/quantity?quantity=10` - 更新产品库存（需要user或admin角色）

### Token校验端点
- `POST /api/introspect` - 实时校验JWT token（需要认证）
- `GET /api/introspect/health` - 健康检查

## 运行项目

### 前置条件
- Java 17+
- Maven 3.6+
- Keycloak服务运行在 `http://localhost:8080`

### 使用Maven运行

```bash
mvn clean package
mvn spring-boot:run
```

### 打包运行

```bash
mvn clean package
java -jar target/demo-backend-1.0.0.jar
```

## 测试

### 测试公开端点
```bash
curl http://localhost:21301/api/public/health
```

### 测试受保护的端点
需要先从Keycloak获取access_token，然后在请求头中添加：

```bash
curl -H "Authorization: Bearer <access_token>" http://localhost:21301/api/users/current
```

### Token Introspection测试
```bash
curl -X POST \
  -H "Authorization: Bearer <access_token>" \
  http://localhost:21301/api/introspect
```

## 数据库

项目使用H2内存数据库，启动后可通过以下方式访问：
- 控制台: http://localhost:21301/h2-console
- JDBC URL: `jdbc:h2:mem:demo`
- 用户名: `sa`
- 密码: `password`

## 安全特性

1. **JWT验证**: 所有受保护的端点都需要有效的JWT token
2. **RBAC**: 基于角色的访问控制（user, admin）
3. **PKCE支持**: 通过Keycloak的Authorization Code流程支持PKCE
4. **CORS**: 配置允许前端跨域访问
5. **Token Introspection**: 支持实时token校验

## 常见问题

### 1. JWT验证失败
检查：
- Keycloak是否正常运行
- application.yml中的issuer_uri是否正确
- token是否过期

### 2. 403 Forbidden
检查：
- 用户是否具有所需的角色
- SecurityConfig中的角色配置是否正确
- Keycloak中的realm roles设置

### 3. CORS错误
检查SecurityConfig中的corsConfigurationSource配置，确保前端地址在允许列表中。

## 下一步

- 完善单元测试和集成测试
- 添加API文档（Swagger/OpenAPI）
- 实现token刷新机制
- 添加日志审计功能
