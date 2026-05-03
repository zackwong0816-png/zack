# NOVA 品牌官网重构 — 前后端分离架构

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Vue 3 + Vite + Pinia + Vue Router + Axios |
| 后端 | NestJS + Mongoose + JWT + bcrypt |
| 数据库 | MongoDB |
| 部署 | 支持 Docker / Vercel / Railway |

## 快速启动

### 前置条件
- Node.js 18+
- MongoDB 运行中 (`mongod`)
- npm 或 yarn

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
# 后端（http://localhost:3000）
cd backend
npm run start:dev

# 前端（http://localhost:5173）
cd frontend
npm run dev
```

### 3. 环境变量（后端）

复制 `backend/.env.example` 为 `backend/.env` 并修改密码：

```bash
cp .env.example .env
```

### 4. 初始化数据

首次启动后，访问任意产品接口会自动种子 6 个示例产品。

---

## 项目结构

```
nova重构/
├── frontend/                    # Vue 3 前端
│   ├── src/
│   │   ├── api/               # Axios 封装 + 接口模块
│   │   ├── components/       # 共享组件（Toast、ProductCard 等）
│   │   ├── composables/       # 组合式函数（useToast）
│   │   ├── router/            # Vue Router 配置
│   │   ├── stores/            # Pinia 状态管理
│   │   ├── utils/             # 工具函数
│   │   └── views/             # 页面组件
│   │       ├── admin/         # 管理后台页面
│   │       └── *.vue           # 用户端页面
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                    # NestJS 后端
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # 认证（JWT + bcrypt）
│   │   │   ├── members/       # 会员管理
│   │   │   ├── products/      # 产品 + 分类
│   │   │   ├── orders/        # 订单
│   │   │   ├── cart/           # 购物车
│   │   │   ├── coupons/       # 优惠券
│   │   │   ├── admin/         # 管理后台 API
│   │   │   ├── stores/        # 门店数据
│   │   │   └── articles/       # 文章内容
│   │   └── common/            # 守卫、拦截器、DTO
│   ├── .env.example
│   └── package.json
│
└── plans/                      # 重构计划文档
```

## API 路由一览

### 认证
| 方法 | 路径 | 说明 | 守卫 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | — |
| POST | /api/auth/login | 登录 | — |
| GET | /api/auth/profile | 获取当前用户 | JWT |
| PUT | /api/auth/profile | 更新用户信息 | JWT |
| PUT | /api/auth/password | 修改密码 | JWT |
| POST | /api/auth/admin/login | 后台登录 | — |

### 产品
| 方法 | 路径 | 说明 | 守卫 |
|------|------|------|------|
| GET | /api/products | 列表（支持搜索/分页/分类） | — |
| GET | /api/products/:id | 详情 | — |
| POST | /api/products | 创建 | Admin |
| PUT | /api/products/:id | 更新 | Admin |
| DELETE | /api/products/:id | 删除 | Admin |
| GET | /api/categories | 分类列表 | — |

### 购物车 & 订单
| 方法 | 路径 | 说明 | 守卫 |
|------|------|------|------|
| GET | /api/cart | 获取购物车 | JWT |
| POST | /api/cart/items | 添加商品 | JWT |
| PUT | /api/cart/items/:id | 更新数量 | JWT |
| DELETE | /api/cart/items/:id | 删除商品 | JWT |
| POST | /api/orders | 创建订单 | JWT |
| GET | /api/orders | 我的订单 | JWT |
| GET | /api/orders/:id | 订单详情 | JWT |
| PUT | /api/orders/:id/cancel | 取消订单 | JWT |
| PUT | /api/orders/:id/status | 更新状态 | Admin |

### 管理后台
| 方法 | 路径 | 说明 | 守卫 |
|------|------|------|------|
| GET | /api/admin/dashboard | 仪表盘数据 | Admin |
| GET | /api/admin/members | 会员列表 | Admin |
| PUT | /api/admin/members/:id | 更新会员 | Admin |
| GET | /api/admin/messages | 留言列表 | Admin |
| PUT | /api/admin/messages/:id/reply | 回复留言 | Admin |
| PUT | /api/admin/settings | 系统设置 | Admin |

### 内容
| 方法 | 路径 | 说明 | 守卫 |
|------|------|------|------|
| GET | /api/stores | 门店列表 | — |
| GET | /api/articles | 文章列表 | — |
| POST | /api/messages | 提交留言 | — |
