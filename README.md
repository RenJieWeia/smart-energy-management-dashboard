# 🌐 智慧能源管理大屏 (Smart Energy Management Dashboard)

一个基于 React + Three.js 构建的现代化能源管理可视化大屏系统，采用 3D 智慧城市场景呈现能源数据，支持实时监控、数据分析与告警管理。集成蜂鸟物联平台实现设备数据实时采集与展示。

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-0.172-000000?logo=three.js)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)

## ✨ 特性

- 🏙️ **3D 智慧城市场景** - 使用 React Three Fiber 构建沉浸式 3D 城市可视化
- 📊 **实时数据监控** - 能源消耗、碳排放、新能源占比等核心指标实时展示
- 🔌 **蜂鸟物联集成** - 接入蜂鸟物联平台，实现设备数据 5 秒自动刷新
- 🌡️ **多维度监测** - 温度、压力、流量、设备状态等全方位数据监控
- 📈 **丰富图表组件** - 集成 Recharts 实现多维度数据可视化
- 🚨 **智能告警系统** - 分级告警管理，支持严重/警告/正常三级状态
- 🎨 **科技感 UI 设计** - 深色主题 + 赛博朋克风格视觉效果
- ⚡ **高性能渲染** - 基于 Vite 构建，支持热更新与快速编译

## 🛠️ 技术栈

| 类型 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 3D 渲染 | Three.js + @react-three/fiber + @react-three/drei |
| 图表库 | Recharts |
| 图标库 | Lucide React |
| 路由 | React Router v7 |
| 构建工具 | Vite |
| 样式方案 | Tailwind CSS |
| 反向代理 | Caddy |

## 📁 项目结构

```
src/
├── components/
│   ├── 3d/                    # 3D 场景组件
│   │   ├── BuildingGroup.tsx  # 建筑群组
│   │   ├── CentralHub.tsx     # 中心枢纽
│   │   ├── CityBase.tsx       # 城市底座
│   │   ├── DataFlowCable.tsx  # 数据流动线缆
│   │   ├── EnergyConsumptionModel.tsx  # 能源消耗模型
│   │   ├── PatrolDrone.tsx    # 巡逻无人机
│   │   └── SceneLights.tsx    # 场景灯光
│   ├── common/                # 通用组件
│   │   ├── AnimatedNumber.tsx # 数字动画
│   │   ├── ChartWidget.tsx    # 图表容器
│   │   └── EnergyLinkLines.tsx # 能源连接线
│   ├── hummingbird/           # 蜂鸟物联组件
│   │   ├── TemperatureChart.tsx       # 温度监测图表
│   │   ├── PressureChart.tsx          # 压力监测图表
│   │   ├── FlowMeterChart.tsx         # 流量监测图表
│   │   ├── DeviceStatusList.tsx       # 设备状态列表
│   │   ├── EnergyHeatMeterChart.tsx   # 电能与热量监测
│   │   └── ExternalMeterSection.tsx   # 外部电表数据（三台独立电表）
│   ├── test/                  # 测试组件
│   │   └── HummingBirdApiTest.tsx     # 蜂鸟 API 连接测试页
│   └── layout/                # 布局组件
│       ├── Header.tsx         # 顶部标题栏
│       ├── LeftColumn.tsx     # 左侧面板
│       ├── RightColumn.tsx    # 右侧面板
│       ├── CenterVisual.tsx   # 中心 3D 可视化区
│       └── BottomRow.tsx      # 底部统计栏
├── contexts/
│   └── DashboardContext.tsx   # 全局数据状态管理
├── hooks/
│   ├── useCityLayout.ts       # 城市布局 Hook
│   └── useHummingBird.tsx     # 蜂鸟物联数据 Hook
├── pages/
│   ├── HomePage.tsx           # 主页（大屏展示）
│   ├── ApiTestPage.tsx        # API 测试页
│   └── DeviceMonitorPage.tsx  # 设备监控页
├── router/
│   └── index.tsx              # 路由配置
├── sdk/
│   └── hbsdk.ts               # 蜂鸟物联 SDK 封装
├── services/
│   ├── api.ts                 # API 基础封装
│   └── dashboardService.ts    # 仪表盘数据服务
├── types/
│   ├── types.ts               # TypeScript 类型定义
│   └── hummingbird.ts         # 蜂鸟物联类型定义
├── data/
│   ├── colors.ts              # 颜色配置
│   └── mockData.ts            # 模拟数据
└── utils/
    ├── constants.ts           # 常量配置
    ├── iconMap.ts             # 图标映射
    ├── request.ts             # HTTP 请求封装
    ├── switchCodeUtil.ts      # 开关码解析工具
    └── token.ts               # Token 管理
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm / yarn / pnpm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看项目

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 🐳 Docker 部署

项目已配置 Dockerfile 和 Caddyfile，支持容器化部署：

```bash
# 构建镜像
docker build -t smart-energy-dashboard .

# 运行容器
docker run -p 80:80 smart-energy-dashboard
```

## 🔀 反向代理配置

项目使用 Caddy 作为反向代理解决蜂鸟物联平台的跨域问题。生产环境中所有 `/v1.0/openapi/*` 请求由 Caddy 转发至蜂鸟后端，前端只需使用同源相对路径。

**Caddy 代理规则（Caddyfile）：**
```
handle /v1.0/openapi/* {
    reverse_proxy hb.jingneng.site:81
}
```

**本地开发（vite.config.ts）：**
```js
proxy: {
  '/v1.0/openapi': {
    target: 'http://hb.jingneng.site:81',
    changeOrigin: true,
  }
}
```

## 📊 数据接口

### 蜂鸟物联平台

系统通过 `useHummingBirdApi` Hook 接入蜂鸟物联平台，支持按设备 ID 实时采集数据：

| Hook 用法 | 说明 |
|-----------|------|
| `useHummingBirdApi()` | 默认设备（42222843），5 秒轮询 |
| `useHummingBirdApi(deviceId)` | 指定设备，5 秒轮询 |
| `useHummingBirdApi(deviceId, 0)` | 指定设备，禁用自动轮询 |

**SDK 接口（`src/sdk/hbsdk.ts`）：**

| 函数 | 路径 | 说明 |
|------|------|------|
| `getDeviceLastData(deviceId)` | `GET /device/{id}/thing-model/property` | 获取设备最新属性数据 |
| `getDeviceInfo(deviceId)` | `GET /device/{id}` | 获取设备详细信息 |
| `updateDevice(deviceId, params)` | `POST /device/control` | 控制设备 |
| `getDeviceHistoryData(deviceId, params)` | `GET /device/{id}/thing-model/history` | 获取历史数据 |

**监测设备：**

| 设备 ID | 用途 |
|---------|------|
| 42222843 | 主控设备（热泵、水泵、温度、压力、流量） |
| 62415514 | 1# 独立电表 |
| 47862598 | 2# 独立电表 |
| 28022392 | 3# 独立电表 |

**主控设备监测数据：**
- **温度监测** - 高区/低区/井水供回水温度、室外温度
- **压力监测** - 高区/低区/井水供回水压力
- **流量监测** - 5 路流量计瞬时流量
- **电能与热量** - 热泵电能表功率/电量、热量表瞬时热量/流量、系统 COP
- **设备状态** - 热泵机组运行状态、水泵变频频率
- **水位监测** - 补水箱水位

### API 测试页

访问 `/api-test` 路由可查看所有设备的实时数据、连接状态和原始响应，支持手动刷新。

### Dashboard Context

系统支持通过 `DashboardContext` 进行数据管理，主要数据结构包括：

- **todayEnergyTrend** - 今日能耗趋势
- **renewableSubstitutionData** - 新能源替代数据
- **phaseQualityData** - 相位质量数据
- **peakValleyDistribution** - 峰谷分布
- **energyRanking** - 能耗排名
- **energySourceMix** - 能源结构占比
- **alerts** - 告警信息
- **centerStats** - 中心统计指标
- **monthlyCarbonTrend** - 月度碳排放趋势
- **kpiData** - KPI 雷达图数据

## 📝 License

MIT License


一个基于 React + Three.js 构建的现代化能源管理可视化大屏系统，采用 3D 智慧城市场景呈现能源数据，支持实时监控、数据分析与告警管理。集成蜂鸟物联平台实现设备数据实时采集与展示。

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-0.172-000000?logo=three.js)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)

## ✨ 特性

- 🏙️ **3D 智慧城市场景** - 使用 React Three Fiber 构建沉浸式 3D 城市可视化
- 📊 **实时数据监控** - 能源消耗、碳排放、新能源占比等核心指标实时展示
- 🔌 **蜂鸟物联集成** - 接入蜂鸟物联平台，实现设备数据 5 秒自动刷新
- 🌡️ **多维度监测** - 温度、压力、流量、设备状态等全方位数据监控
- 📈 **丰富图表组件** - 集成 Recharts 实现多维度数据可视化
- 🚨 **智能告警系统** - 分级告警管理，支持严重/警告/正常三级状态
- 🎨 **科技感 UI 设计** - 深色主题 + 赛博朋克风格视觉效果
- ⚡ **高性能渲染** - 基于 Vite 构建，支持热更新与快速编译

## 🛠️ 技术栈

| 类型 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 3D 渲染 | Three.js + @react-three/fiber + @react-three/drei |
| 图表库 | Recharts |
| 图标库 | Lucide React |
| 路由 | React Router v7 |
| 构建工具 | Vite |
| 样式方案 | Tailwind CSS |

## 📁 项目结构

```
src/
├── components/
│   ├── 3d/                    # 3D 场景组件
│   │   ├── BuildingGroup.tsx  # 建筑群组
│   │   ├── CentralHub.tsx     # 中心枢纽
│   │   ├── CityBase.tsx       # 城市底座
│   │   ├── DataFlowCable.tsx  # 数据流动线缆
│   │   ├── EnergyConsumptionModel.tsx  # 能源消耗模型
│   │   ├── PatrolDrone.tsx    # 巡逻无人机
│   │   └── SceneLights.tsx    # 场景灯光
│   ├── common/                # 通用组件
│   │   ├── AnimatedNumber.tsx # 数字动画
│   │   ├── ChartWidget.tsx    # 图表容器
│   │   └── EnergyLinkLines.tsx # 能源连接线
│   ├── hummingbird/           # 蜂鸟物联组件
│   │   ├── TemperatureChart.tsx   # 温度监测图表
│   │   ├── PressureChart.tsx      # 压力监测图表
│   │   ├── FlowMeterChart.tsx     # 流量监测图表
│   │   └── DeviceStatusList.tsx   # 设备状态列表
│   └── layout/                # 布局组件
│       ├── Header.tsx         # 顶部标题栏
│       ├── LeftColumn.tsx     # 左侧面板
│       ├── RightColumn.tsx    # 右侧面板
│       ├── CenterVisual.tsx   # 中心 3D 可视化区
│       └── BottomRow.tsx      # 底部统计栏
├── contexts/
│   └── DashboardContext.tsx   # 全局数据状态管理
├── hooks/
│   ├── useCityLayout.ts       # 城市布局 Hook
│   └── useHummingBird.tsx     # 蜂鸟物联数据 Hook
├── pages/
│   ├── HomePage.tsx           # 主页（大屏展示）
│   └── DeviceMonitorPage.tsx  # 设备监控页
├── router/
│   └── index.tsx              # 路由配置
├── sdk/
│   └── hbsdk.ts               # 蜂鸟物联 SDK 封装
├── services/
│   ├── api.ts                 # API 基础封装
│   └── dashboardService.ts    # 仪表盘数据服务
├── types/
│   ├── types.ts               # TypeScript 类型定义
│   └── hummingbird.ts         # 蜂鸟物联类型定义
├── data/
│   ├── colors.ts              # 颜色配置
│   └── mockData.ts            # 模拟数据
└── utils/
    ├── constants.ts           # 常量配置
    ├── iconMap.ts             # 图标映射
    ├── request.ts             # HTTP 请求封装
    ├── switchCodeUtil.ts      # 开关码解析工具
    └── token.ts               # Token 管理
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm / yarn / pnpm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看项目

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 🐳 Docker 部署

项目已配置 Dockerfile 和 Caddyfile，支持容器化部署：

```bash
# 构建镜像
docker build -t smart-energy-dashboard .

# 运行容器
docker run -p 80:80 smart-energy-dashboard
```

## 📊 数据接口

### 蜂鸟物联平台

系统通过 `useHummingBirdApi` Hook 接入蜂鸟物联平台，实现设备数据实时采集：

- **数据刷新间隔** - 默认 5 秒自动轮询
- **温度监测** - 高区/低区/井水供回水温度、室外温度
- **压力监测** - 高区/低区/井水供回水压力
- **流量监测** - 5 路流量计瞬时流量
- **设备状态** - 热泵机组运行状态、水泵变频频率
- **水位监测** - 补水箱水位

### Dashboard Context

系统支持通过 `DashboardContext` 进行数据管理，主要数据结构包括：

- **todayEnergyTrend** - 今日能耗趋势
- **renewableSubstitutionData** - 新能源替代数据
- **phaseQualityData** - 相位质量数据
- **peakValleyDistribution** - 峰谷分布
- **energyRanking** - 能耗排名
- **energySourceMix** - 能源结构占比
- **alerts** - 告警信息
- **centerStats** - 中心统计指标
- **monthlyCarbonTrend** - 月度碳排放趋势
- **kpiData** - KPI 雷达图数据

## 📝 License

MIT License