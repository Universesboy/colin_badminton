# Chalk 品牌生态设计规范（Colin Badminton × Coach Chalk）

两个产品属于同一个品牌生态：

- **Coach Chalk**：教练经营与训练运营产品（浅色、工具感、信息密度高）。
- **Colin Badminton**：教练个人品牌与技术内容平台（深色舞台、运动员身份、空间感）。

用户从一个跳到另一个时，应当感觉是"同一品牌的另一个专业产品"。做到这一点的方法是：**共享层完全一致，产品层各自发挥**。

- 共享层的源文件：[`design-tokens/chalk.tokens.json`](../../design-tokens/chalk.tokens.json)（W3C Design Tokens 格式，可被 Style Dictionary / Tailwind 读取）。
- 本站实现：[`src/styles/tokens.css`](../../src/styles/tokens.css) 的 `--chalk-*` 变量（共享层）和其余变量（Colin 层）。
- 审计与决策记录：[AUDIT.md](./AUDIT.md)。

## 1. 颜色

### 共享层（必须两站一致）

| Token | 值 | 用途 |
| --- | --- | --- |
| `chalk.ink` | `#1e2a24` | 正文、浅底主按钮 |
| `chalk.ink-hover` | `#2c3b33` | 主按钮悬停 |
| `chalk.forest` | `#1f5c45` | Logo 底色、深绿强调 |
| `chalk.forest-deep` | `#133a2c` | 品牌区块背景 |
| `chalk.lime` | `#c8f169` | 粉笔青柠：深底主按钮、标记、数据高亮 |
| `chalk.lime-hover` | `#b8e553` | 青柠悬停 |
| `chalk.lime-soft` / `lime-border` | `#eef6d8` / `#cfe3a0` | 浅底标签 |
| `chalk.lime-ink` | `#3f6a0a` | 浅底上需要青柠色系的文字（5.6:1） |
| `chalk.paper` | `#f3f1e7` | 浅色页面背景 |
| `chalk.surface` / `surface-muted` | `#ffffff` / `#efede3` | 卡片 / 凹陷面 |
| `chalk.border` / `border-strong` / `border-input` | `#e0ddd0` / `#cbc7b6` / `#8a8d82` | 边框 |
| `chalk.text-secondary` / `text-muted` | `#4b5650` / `#5e6b64` | 次要文字 |
| `chalk.focus` | `#1d5fa8` | 焦点环 |
| 状态色 | success `#1f7a4d` · warning `#9a5b00` · danger `#b42318` · info `#1d5fa8` | 表单与提示 |

**规则**：青柠只做"填充"和深底上的文字，不在浅底上做正文；浅底文字用 `ink` 或 `lime-ink`。

### Colin 产品层

| Token | 值 | 用途 |
| --- | --- | --- |
| `night-950 … night-300` | `#070d0a` → `#9fb0a6` | 夜间球场舞台（深色区块、Hero、页头、页脚） |
| `signal` | `#e8452c` | Colin 签名红，只做小面积点缀（Hero 状态点、3D 羽毛球红圈、训练图中的球员点），不用于按钮、文字或大面积背景 |

Coach Chalk 如需深色模式，直接使用 `night-*` 作为深色面板色，保持两站深色一致。

## 2. 字体

| 角色 | 字体 | 规则 |
| --- | --- | --- |
| Display | Space Grotesk 500/600/700 | Coach Chalk：常规大小写，`-0.02em ~ -0.035em`。Colin：H1/H2 全大写，`-0.035em ~ -0.045em`，体现竞技感 |
| Body | Inter 400/500/600/700 | 16px / 1.6，最大行宽约 68ch |
| 中文回退 | PingFang SC → Hiragino Sans GB → Microsoft YaHei → Noto Sans SC | 两站相同 |

字号阶梯（Colin）：`mega` 4.5–15rem（只用于装饰性大数字）、`hero` 3.5–9rem、`h1` 2.75–5.5rem、`h2` 2.1–3.75rem、`h3` 1.25–1.5rem、`lead` 1.06–1.25rem、`small` 0.875rem、`eyebrow` 0.75rem（字距 0.16em）。

## 3. 形状、间距与阴影

- 间距：4px 基准，`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128`。
- 圆角：`6`（小标签）、`10`（按钮、输入框、图标按钮）、`14`（卡片）、`24`（大型媒体面板，仅 Colin）、`999`（胶囊）。
- 阴影：带绿调 `rgba(23,32,28,…)`。`xs` 卡片静止、`md` 悬停、`lg` 大面板；深色舞台上用 `glow-lime`（青柠微光）代替阴影。
- 内容最大宽 1280px，左右边距 `clamp(16px, 4vw, 48px)`。

## 4. 组件规范

| 组件 | 规范 | Colin 实现 |
| --- | --- | --- |
| 主按钮 | 48px 高、10px 圆角、650 字重、左右 22px。浅底：墨绿底白字；深底：青柠底墨绿字，悬停加 `glow-lime` | `.btn` |
| 次按钮 | 透明底 + `border-strong` 描边，悬停描边变为文字色 | `.btn--ghost` |
| 小按钮 | 40px 高、14px 内边距、14px 字号 | `.btn--sm`、导航 CTA |
| 输入框 | 46px 高、10px 圆角、`border-input` 边框、白底；标签 14px/600 在上方 | `.field` |
| 胶囊标签 | `lime-soft` 底 + `lime-border` 边框 + 墨绿字（深底时 10% 青柠底 + 青柠字） | `.pill` |
| 筛选标签 | 40px 胶囊，选中态浅底为墨绿实心，深底为青柠实心 | `.chip[aria-pressed]` |
| 卡片 | 白底（深色为 `night-800`）、1px 边框、14px 圆角、24px 内边距 | `.step`、`.level` 等 |
| 步骤编号 | 32px 圆形墨绿底白字（深底青柠） | `.step__n` |
| 表格 | 白底 + 边框 + 14px 圆角容器，表头 `surface-muted`，行分隔线 | 成绩表 `.record__table` |
| 导航 | 吸顶、半透明 + 背景模糊；当前页为胶囊高亮 + 青柠小方点 | `Navbar` |
| Logo | 32px 网格，8px 圆角方块 `#1F5C45`，白色图形，青柠圆点 `#C8E86B` | Coach Chalk = 字母 C；Colin = 羽毛球 |
| 图标 | 24px 网格线性图标，1.75–1.8 描边，圆角端点，`currentColor` | `Icon.js` |
| 焦点 | 3px `focus` 色描边，offset 2px，所有可交互元素 | `:focus-visible` |

## 5. 动效规则

| Token | 值 | 用途 |
| --- | --- | --- |
| `duration` | 120ms | 颜色、边框、按下（与 Coach Chalk 相同） |
| `dur-base` | 280ms | 小位移、展开 |
| `dur-slow` | 640ms | 图片缩放、轨迹进度 |
| `dur-reveal` | 900ms | 滚动进入 |
| `ease-out` | `cubic-bezier(.16,1,.3,1)` | 默认 |
| `ease-spring` | `cubic-bezier(.34,1.4,.64,1)` | 播放按钮、编号等小元素的弹性 |

- Coach Chalk 以 120ms 的状态反馈为主；Colin 在此基础上增加"运动感"：滚动进入、指针视差、3D 倾斜卡片、路由切换上浮。
- 每屏同时运动的元素不超过 3 组；装饰动画（球场漂移、焦点圈脉冲）周期 ≥ 2.8s。
- `prefers-reduced-motion: reduce` 时所有时长归零，视差、倾斜、3D 动画全部停用，3D 场景退化为一帧静态回合。

## 6. 3D 与性能

- 分级（`src/components/useMotionPrefs.js` → `sceneTier()`）：
  - `3d`：桌面、精细指针、≥4 核、≥4GB 内存、支持 WebGL、未开省流量 → 按需加载 `HeroScene3D`（three.js，单独 chunk）。
  - `2d`：手机/平板/低配/省流量/无 WebGL → `CourtScene` 2D canvas（无第三方库）。
  - `static`：减少动态 → 静态一帧。
- 运行时降级：渲染循环只在 Hero 可见且标签页可见时运行；像素比上限 1.75，连续 90 帧均值 >30ms 降到 1，再 >40ms 切换到 2D；WebGL 上下文丢失或报错也切换到 2D。
- 图片：全部 webp、显式宽高（防布局偏移）、首屏以外 `loading="lazy"`；Hero 抠图 62 KB，仅首页 preload。
- 字体：Google Fonts `display=swap`，只加载用到的字重。

## 7. 响应式

断点：`sm 640px · md 960px · lg 1200px`（Coach Chalk 另有 720/900/1000 营销页断点，组件内部可沿用）。

- 手机不是桌面缩小版：Hero 改为海报式构图（运动员在上、名字压在运动员下方），资历条 2×2；成长轨迹每一步自带照片；成绩表变为堆叠行；筛选标签可横向滑动；按钮在 560px 以下撑满。
- 触控目标 ≥ 40px；`env(safe-area-inset-*)` 用于页脚与菜单。

## 8. 未来融合路线

1. **现在**：两站各自引用同一份 token 值（本仓库 JSON 为参考源）。
2. **下一步**：把 `chalk.tokens.json` 移到独立仓库或 npm 包，用 Style Dictionary 生成 CSS 变量（本站）和 Tailwind theme（Coach Chalk）。
3. **之后**：若两站统一到同一技术栈，再抽取共享 React 组件（Button、Field、Pill、Chip、Card、Nav、Logo）。在此之前不为了视觉统一重构任何一边的架构。
