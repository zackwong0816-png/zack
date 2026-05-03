# NOVA 品牌官网重构计划
## 技术栈：Vue 3 + NestJS + MongoDB

---

## 项目架构

```
nova重构/
├── frontend/          # Vue 3 前端（Vite + Pinia + Vue Router）
│   ├── src/
│   │   ├── views/        # 页面组件
│   │   ├── components/   # 公共组件
│   │   ├── stores/       # Pinia 状态管理
│   │   ├── api/          # Axios 接口封装
│   │   ├── router/       # 路由配置
│   │   └── utils/        # 工具函数
│   └── package.json
│
├── backend/           # NestJS 后端
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # 认证模块（JWT）
│   │   │   ├── members/      # 会员模块
│   │   │   ├── products/     # 产品模块
│   │   │   ├── orders/       # 订单模块
│   │   │   ├── cart/         # 购物车模块
│   │   │   ├── coupons/      # 优惠券模块
│   │   │   └── admin/        # 管理后台模块
│   │   ├── common/       # 公共守卫、拦截器、DTO
│   │   └── app.module.ts
│   └── package.json
│
└── shared/            # 共享类型定义（TypeScript）
    └── types/
```

---

## 执行阶段总览

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| Phase 1 | 项目初始化（前后端骨架 + MongoDB 连接） | P0 |
| Phase 2 | 通用模块（Auth JWT、用户注册/登录、API 拦截器） | P0 |
| Phase 3 | 产品模块（CRUD + 分类 + 搜索 + 分页） | P0 |
| Phase 4 | 会员模块（信息管理、积分、等级） | P1 |
| Phase 5 | 购物车模块（增删改查、 localStorage 同步） | P0 |
| Phase 6 | 订单模块（下单、状态流转、取消） | P1 |
| Phase 7 | 前端——用户端页面（首页、产品页、详情页、购物车、结算、会员中心） | P0 |
| Phase 8 | 前端——内容页面（关于我们、联系、门店、内容中心） | P2 |
| Phase 9 | 管理后台——仪表盘 + 产品管理 + 订单管理 | P1 |
| Phase 10 | 管理后台——会员管理 + 优惠券 + 内容管理 + 设置 | P1 |
| Phase 11 | 安全加固（输入校验、限流、RBAC、CORS） | P1 |
| Phase 12 | 部署配置（Docker/Vercel/Nginx） | P2 |

---

## Phase 1：项目初始化

### Step 1.1：初始化前端（Vue 3 + Vite）

**目标**：搭建前端工程骨架

```
frontend/
├── src/
│   ├── api/          # $api 封装
│   ├── components/   # 共享组件
│   ├── composables/  # 组合式函数
│   ├── router/       # Vue Router
│   ├── stores/       # Pinia stores
│   ├── utils/        # 工具函数
│   ├── views/        # 页面
│   ├── App.vue
│   └── main.ts
├── index.html
├── vite.config.ts
└── package.json
```

**关键依赖**：
- `vue@3`、`vue-router@4`、`pinia`
- `axios`、`@vueuse/core`
- `typescript`、`vite`

**验证命令**：`cd frontend && npm install && npm run dev`

---

### Step 1.2：初始化后端（NestJS + MongoDB）

**目标**：搭建后端工程骨架，连接 MongoDB

```
backend/src/
├── app.module.ts
├── main.ts
└── modules/
```

**关键依赖**：
- `@nestjs/core`、`@nestjs/common`
- `@nestjs/mongoose`、`mongoose`
- `@nestjs/jwt`、`@nestjs/passport`、`passport-jwt`
- `class-validator`、`class-transformer`
- `bcrypt`

**验证命令**：`cd backend && npm install && npm run start:dev`
**连接字符串**：`mongodb://localhost:27017/nova`

---

### Step 1.3：创建共享类型包（可选，后端为主）

**目标**：定义 TypeScript 接口，供前后端共用

```typescript
// shared/types/index.ts
export interface Member { id: string; nickname: string; phone: string; level: MemberLevel; points: number; ... }
export interface Product { id: string; name: string; price: number; category: string; ... }
export interface Order { id: string; memberId: string; items: OrderItem[]; status: OrderStatus; ... }
export type MemberLevel = 'bronze' | 'silver' | 'gold';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
```

---

## Phase 2：通用模块（Auth + 基础建设）

### Step 2.1：Auth 模块（JWT）

**后端**：
- `POST /auth/register` — 注册（手机号 + 密码，bcrypt hash）
- `POST /auth/login` — 登录（返回 JWT access_token + refresh_token）
- `POST /auth/refresh` — 刷新 token
- `GET /auth/profile` — 获取当前用户信息（JWT 保护）
- `JwtAuthGuard` — 守卫：验证 Bearer token

**前端**：
- `api/auth.ts` — 封装 login/register/refresh/profile
- `stores/auth.ts` — Pinia store（token 存储在 localStorage，响应拦截器自动附加 token）
- 路由守卫：`router.beforeEach` 未登录重定向到登录页

**数据模型**：
```typescript
// Member Schema
{ phone: string, password: string, nickname: string,
  level: 'bronze'|'silver'|'gold', points: number,
  createdAt: Date }
```

**Admin 认证**：
- `POST /auth/admin/login` — 后台登录（独立 JWT，含 role: 'admin'）
- `JwtAdminGuard` — 守卫：验证 role === 'admin'

---

### Step 2.2：API 统一响应与错误处理

**后端**：
- 全局响应拦截器：统一 `{ code, data, message }` 格式
- 全局异常过滤器：业务异常 `BusinessException` → 4xx；未知异常 → 500
- 全局请求日志：`LoggingInterceptor`

**前端**：
- Axios 实例：`baseURL = '/api'`，响应拦截器统一处理 401（token 过期）、403、500
- `api/utils.ts` — 错误提示封装

---

## Phase 3：产品模块

### Step 3.1：产品 CRUD + 分类

**后端接口**：
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /products | 列表（支持分类/搜索/分页/排序） |
| GET | /products/:id | 详情 |
| POST | /products | 创建（Admin） |
| PUT | /products/:id | 更新（Admin） |
| DELETE | /products/:id | 删除（Admin） |
| GET | /categories | 分类列表 |

**数据模型**：
```typescript
// Product
{ id, name, desc, price, originalPrice,
  category: ObjectId, tags: string[],
  images: string[], stock: number,
  sales: number, rating: number,
  reviews: Review[], status: 'active'|'inactive',
  createdAt, updatedAt }
// Category
{ name, slug, icon, sort }
```

**前端**：
- `api/products.ts` — 接口封装
- `stores/products.ts` — Pinia store
- `views/ProductsView.vue` — 列表页（含筛选/分页）
- `views/ProductDetailView.vue` — 详情页

---

## Phase 4：会员模块

### Step 4.1：会员信息管理

**后端接口**：
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /members/me | 当前会员信息 |
| PUT | /members/me | 更新昵称/头像 |
| PUT | /members/me/password | 修改密码 |
| GET | /members/me/orders | 我的订单列表 |
| GET | /members/me/points | 积分记录 |

**积分规则**：
- 消费 1 元 = 1 积分
- 积分可抵扣（100 积分 = 1 元）

---

## Phase 5：购物车模块

### Step 5.1：前后端购物车

**后端接口**（会员未登录时用 anonymousId 关联）：
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /cart | 获取购物车 |
| POST | /cart/items | 添加商品 |
| PUT | /cart/items/:productId | 更新数量 |
| DELETE | /cart/items/:productId | 删除商品 |
| DELETE | /cart | 清空购物车 |

**前端**：
- `stores/cart.ts` — Pinia store（与后端同步 + 离线乐观更新）
- `components/CartDrawer.vue` — 侧边购物车抽屉
- `views/CartView.vue` — 购物车页面

---

## Phase 6：订单模块

### Step 6.1：下单与状态流转

**数据模型**：
```typescript
// Order
{ orderNo, memberId, items: [{productId, name, price, qty}],
  totalAmount, status, address,
  paymentMethod, paymentStatus,
  createdAt, updatedAt }
// Status: pending → paid → shipped → completed
//         └→ cancelled（pending 可取消）
```

**后端接口**：
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /orders | 创建订单（从购物车结算） |
| GET | /orders | 订单列表（支持状态筛选） |
| GET | /orders/:id | 订单详情 |
| PUT | /orders/:id/cancel | 取消订单 |
| PUT | /orders/:id/status | 更新状态（Admin） |

**前端**：
- `stores/order.ts` — Pinia store
- `views/CheckoutView.vue` — 结算页（选地址、选支付方式）
- `views/OrderSuccessView.vue` — 下单成功页

---

## Phase 7：前端——用户端页面

### 页面清单

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 轮播、产品展示、统计数据 |
| 产品列表 | `/products` | 分类筛选、搜索、分页 |
| 产品详情 | `/products/:id` | 轮播图、规格、评价、加入购物车 |
| 购物车 | `/cart` | 购物车列表、数量修改、结算 |
| 结算页 | `/checkout` | 地址选择、支付方式 |
| 会员中心 | `/member` | 个人信息、订单入口、积分 |
| 登录 | `/login` | 手机号 + 密码登录 |
| 注册 | `/register` | 手机号注册 |
| 关于我们 | `/about` | 品牌故事 |
| 联系我们 | `/contact` | 联系表单 + FAQ |
| 门店查询 | `/stores` | 门店列表/地图 |
| 内容中心 | `/content` | 文章列表 |

---

## Phase 8：前端——内容页面

**`views/AboutView.vue`** — 品牌故事（静态内容）
**`views/ContactView.vue`** — 联系页面（含表单提交到后端 `/messages`）
**`views/StoresView.vue`** — 门店查询
**`views/ContentView.vue`** — 文章/内容列表

---

## Phase 9：管理后台——核心功能

### Admin 布局

```
AdminLayout
├── AdminSidebar.vue    # 左侧菜单
├── AdminHeader.vue     # 顶部用户信息
└── <router-view>      # 右侧内容区
```

### 仪表盘 `/admin`

- 今日订单数、销售额
- 近 7 天订单趋势图（ECharts）
- 待处理订单数
- 近新注册会员

### 产品管理 `/admin/products`

- 产品列表（分页、搜索、上下架筛选）
- 新增/编辑产品弹窗
- 分类管理 `/admin/categories`

### 订单管理 `/admin/orders`

- 订单列表（状态筛选）
- 订单详情弹窗
- 状态更新（发货操作）

---

## Phase 10：管理后台——完善功能

| 模块 | 路径 | 功能 |
|------|------|------|
| 会员管理 | `/admin/members` | 会员列表、积分调整、等级变更 |
| 优惠券 | `/admin/coupons` | 创建优惠券、领取记录 |
| 内容管理 | `/admin/content` | 文章 CRUD |
| 门店管理 | `/admin/stores` | 门店信息管理 |
| 促销管理 | `/admin/promo` | 促销活动管理 |
| 留言管理 | `/admin/messages` | 用户留言查看、回复 |
| 系统设置 | `/admin/settings` | 修改管理员密码、数据备份 |

---

## Phase 11：安全加固

| 项目 | 实现方式 |
|------|----------|
| 密码存储 | bcrypt（12 轮），不存明文 |
| JWT 安全 | access_token 15min + refresh_token 7d，httpOnly cookie |
| RBAC | 角色守卫 `@Roles('admin')` |
| 输入校验 | `class-validator` DTO 层全面校验 |
| SQL/NoSQL 注入 | Mongoose 参数化查询 |
| XSS | 前后端双重转义 |
| CORS | 白名单配置，仅允许前端域名 |
| 限流 | `@nestjs/throttler` 100req/min |
| 文件上传 | 存储到 OSS，不存本地磁盘 |

---

## Phase 12：部署

### 开发环境验证清单

```bash
# 后端
cd backend && npm run start:dev
# 验证：GET http://localhost:3000/api/products

# 前端
cd frontend && npm run dev
# 验证：http://localhost:5173 正常访问

# 数据库
# 确保 MongoDB 运行中：mongod
```

### 生产部署（推荐）

- **前端**：Vercel / Netlify（静态部署）
- **后端**：Railway / Render / 阿里云 ECS + Nginx
- **MongoDB**：MongoDB Atlas 免费集群 / 阿里云 MongoDB

### Nginx 配置要点

```nginx
# 静态资源缓存
location /assets/ {
  expires 30d;
  add_header Cache-Control "public, immutable";
}

# API 代理
location /api/ {
  proxy_pass http://localhost:3000;
}

# Vue Router History 模式
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 各 Phase 依赖关系

```
Phase 1 (初始化)
    ↓
Phase 2 (Auth) ──→ Phase 3 (产品)
    ↓                      ↓
Phase 4 (会员) ──→ Phase 5 (购物车) ──→ Phase 6 (订单)
                                                ↓
Phase 7 (用户端页面 1-5) ←──────────── Phase 5+6 完成后可开始
    ↓
Phase 8 (用户端页面 6-11)
    ↓
Phase 9 (Admin 核心) ──→ Phase 10 (Admin 完善)
    ↓
Phase 11 (安全加固)
    ↓
Phase 12 (部署)
```

---

## 并行执行建议

以下可并行开发（无依赖交集）：

1. **前端页面开发**（多人可同时做不同页面）
2. **后端各模块**（多人可同时做不同 API 模块）
3. **组件库建设**（与业务解耦，提前完成）

---

## 执行原则

1. **每个 Phase 完成后更新本计划**，标注实际完成情况
2. **每个 Phase 结束前**：跑通核心流程（注册→登录→浏览→下单）
3. **不追求一步到位**：先跑通再优化，功能优先于完美
4. **每次 commit 附带 Phase 标签**：如 `[P3] feat: 产品列表页完成`
5. **前端 API 调用全部 Mock 化**：后端未就绪时不影响前端开发

---

## 快速启动命令（初始阶段）

```bash
# 前端
cd frontend
npm create vite@latest . -- --template vue-ts
npm install vue-router@4 pinia axios @vueuse/core
npm install -D typescript vite

# 后端
cd backend
npm i -g @nestjs/cli
nest new . --package-manager npm
npm install @nestjs/mongoose mongoose @nestjs/jwt @nestjs/passport passport-jwt bcrypt class-validator class-transformer @nestjs/throttler
```
