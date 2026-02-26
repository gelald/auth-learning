# Client Secret 配置说明

## 问题

`demo-backend` 客户端的 Client Secret 在 `demo-realm.json` 中使用的是占位符：

```json
"secret": "${KEYCLOAK_BACKEND_CLIENT_SECRET}"
```

这是因为 Keycloak 在导入 Realm 时，如果客户端配置了 `publicClient: false`，会自动生成一个随机的 Client Secret。

## 获取 Client Secret 的方法

### 方法 1: 从 Admin Console 获取（推荐）

1. 启动 Keycloak：
   ```bash
   cd keycloak
   docker-compose up -d
   ```

2. 访问 Admin Console: http://localhost:8080/admin
   - Username: `admin`
   - Password: `admin`

3. 选择 `demo-realm`（左上角下拉菜单）

4. 左侧菜单 **Clients** → 点击 **demo-backend**

5. 点击 **Credentials** 标签

6. 复制 **Client secret** 的值

7. 更新到后端配置文件：
   ```yaml
   # backend/src/main/resources/application.yml
   keycloak:
     credentials:
       secret: 复制的 secret 值
   ```

### 方法 2: 修改 Realm 导入文件

在导入前修改 `realm-config/demo-realm.json`，将占位符替换为实际值：

```json
{
  "clients": [
    {
      "clientId": "demo-backend",
      "secret": "your-custom-secret-here",
      ...
    }
  ]
}
```

**注意**: 
- Secret 长度至少 8 个字符
- 建议使用强密码（字母 + 数字 + 特殊字符）
- 导入后仍然可以在 Admin Console 中修改

### 方法 3: 使用环境变量（Docker Compose）

修改 `docker-compose.yml`：

```yaml
services:
  keycloak:
    environment:
      # 其他环境变量...
      KEYCLOAK_BACKEND_CLIENT_SECRET: your-secret-here
```

然后修改 `realm-config/demo-realm.json`：

```json
"secret": "${KEYCLOAK_BACKEND_CLIENT_SECRET}"
```

**注意**: 这种方法需要 Keycloak 支持环境变量替换，某些版本可能不支持。

---

## 推荐做法

**使用方法 1**（从 Admin Console 获取），原因：
1. 最简单直接
2. Keycloak 自动生成的 secret 更安全
3. 不需要修改配置文件

---

## 安全提示

1. **不要将包含真实 secret 的配置文件提交到 Git**
2. **生产环境使用环境变量或密钥管理服务**
3. **定期轮换 Client Secret**

---

**更新时间**: 2026-02-25
