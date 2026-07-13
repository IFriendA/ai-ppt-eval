# Dokie Eval

AI PPT 评测平台，基于 Next.js 16 + React 19 + TypeScript。通过同源 `/api/*` 代理转发到后端服务，首页提供邮箱验证码登录。

## 环境要求

- Node.js 20+
- npm 10+

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制示例配置并填写后端地址：

```bash
cp .env.example .env.local
```

`.env.local` 示例：

```bash
BACKEND_BASE_API=http://your-api-server.com:8188
```

`BACKEND_BASE_API` 仅服务端使用，前端请求统一走 `/api/*` 代理，例如 `/api/user/login_email` 会转发到 `{BACKEND_BASE_API}/user/login_email`。

### 3. 启动开发服务

```bash
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器（需先 `build`） |
| `npm run lint` | 运行 ESLint 检查 |

## 项目结构

```
app/
  page.tsx              # 首页（邮箱验证码登录）
  api/[...path]/route.ts # 后端 API 代理
api/
  http.ts               # 请求封装
  userApi.ts            # 用户相关接口
components/
  LoginPage.tsx         # 登录页组件
lib/
  auth.ts               # 本地 token 存储
  proxyBackend.ts       # 代理转发逻辑
```
