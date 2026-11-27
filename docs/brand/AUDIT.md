# Colin Badminton 前端审计与重构计划（2026-11）

本文件记录这次视觉升级之前对网站代码和页面的实际检查结果、对 Coach Chalk 线上前端的分析，以及据此做出的重构决定。规范本身见 [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)。

## 1. 当前网站（升级前）

技术栈：Create React App 5 + React 18 + react-router 6，GitHub Pages 部署（`.github/workflows/static.yml`），`scripts/route-pages.js` 为每个路由生成独立 HTML，`video-stats.yml` 每天刷新 YouTube 播放数据。所有内容集中在 `src/data/site.js`。

| 区域 | 升级前的实现 | 问题 |
| --- | --- | --- |
| 首页 Hero | 左侧 "COLIN / ZHOU" 大字 + 两个按钮，右侧 2D canvas 伪 3D 球场，右上角一张小照片卡 | 首屏视觉主角是装饰性的球场而不是运动员本人；照片只有 330px 的小卡片；红黑配色和 Coach Chalk 没有任何关联 |
| 数据条 | 4 个数字（1st / 2023 / OCAA / 10+） | 和下面 "The athlete" 的荣誉列表、Highlights 页的 Career Statistics 是同一组信息的三次重复 |
| 个人介绍 | 照片 + 4 行荣誉列表（图标 + 标题 + 一句话） | 没有成长轨迹：看不出"四川省队 → 加拿大冠军 → 教练"这条主线 |
| 竞技成绩 | Achievements 页 4 张一样的卡片 | 典型的重复卡片布局；成绩没有层级（CCAA 全国冠军和青少年冠军同等权重） |
| 训练课程 | 理念两段文字 + 视频网格 + 4 张方法论卡片 | 没有训练体系的可视化，没有"适合谁"，视频和方法论之间没有关联 |
| 视频 | 统一的视频卡、分类筛选、排序 | 功能完整（保留），但封面交互单一，教学视频没有技术主题标签 |
| 联系方式 | 方法卡片 + 二维码 + mailto 表单 | 功能正常（保留），视觉与其他页面不统一 |
| 移动端 | 可用，菜单全屏 | Hero 在手机上只是缩小版桌面布局；没有专门的移动构图 |
| 品牌 | 自有的 "Court at night"：墨黑 + 红色 + Barlow Condensed | 与 Coach Chalk（森林绿 + 青柠 + Space Grotesk）完全不同，两个产品看起来不属于同一品牌 |

素材：`public/media` 下有经过压缩的 webp 照片，但没有运动员抠图，Hero 只能用矩形照片；`public/images/img-*.jpg` 是早期模板留下的未使用风景图（未删除，留待确认）。

## 2. Coach Chalk 线上前端（coachchalk.com）

直接读取线上 CSS（`/_next/static/css/index.*.css`、`welcome.*.css`）得到的品牌基因：

- **主色**：`--color-brand #1e2a24`（墨绿，正文与主按钮），`#133a2c`（深森林绿品牌区块），Logo 底色 `#1F5C45`。
- **强调色**：`--color-accent #c8f169`（粉笔青柠），`--color-on-brand` 也是青柠；浅底时用 `#eef6d8` / `#cfe3a0` 做软标签。
- **背景**：`--color-bg #f3f1e7`（暖白"粉笔纸"），卡片纯白，边框 `#e0ddd0`。
- **字体**：Space Grotesk（标题，500/700）+ Inter（正文），中文回退 PingFang SC / Noto Sans SC。
- **按钮**：高 48px、圆角 10px、字重 650；主按钮墨绿底白字，次按钮透明 + `#cbc7b6` 描边。
- **卡片**：白底、1px 边框、圆角 14px、内边距 22–24px，阴影很轻（带绿调 `#17201c`）。
- **导航**：64px 吸顶，半透明 + `backdrop-filter: saturate(1.4) blur(10px)`。
- **图标**：24px 网格线性图标，`stroke-width 1.8`，圆角端点。
- **焦点**：3px `#1d5fa8` 描边，offset 2px。
- **动效**：`--duration .12s`，克制，仅颜色/边框/轻微位移。
- **布局**：内容最大宽 1280px（营销页 1160px），区块上下 64–88px。

## 3. 决定

1. **继承 Coach Chalk 的核心基因**：同一组墨绿/森林绿/青柠/粉笔纸颜色，同样的 Space Grotesk + Inter，同样的按钮、输入框、圆角和焦点样式，Logo 使用同款圆角方块（Colin 的图形是羽毛球，青柠圆点是球头）。
2. **保留 Colin 的运动员个性**：大部分区块放在"夜间球场"深色舞台上（`--night-*`），标题全大写、紧字距，加入抠图运动员、3D 球场和羽毛球轨迹。Colin 的旧红色只保留为极少量的"签名色"（Hero 状态点、3D 羽毛球的球头红圈、训练图中的球员点）。
3. **不强行共享组件库**：Coach Chalk 是 Vite RSC + Tailwind 体系，本站是 CRA + 纯 CSS。先共享 Design Token（`design-tokens/chalk.tokens.json` + `src/styles/tokens.css` 的 `--chalk-*` 层）和组件规范，未来再按需抽取。
4. **3D 走渐进增强**：桌面且硬件足够时按需加载 three.js（约 137 KB gzip，单独 chunk），手机/低性能/省流量走现有 2D canvas，减少动态时显示静态画面。
5. **内容零删减**：所有视频、链接、筛选与排序、每日播放数据刷新保持不变；新增的结构化数据（成长轨迹、成绩表、适合人群、技术标签）全部来自 `site.js` 中已有的事实。

## 4. 页面重构清单

- 首页：Hero（抠图运动员 + 2023 描边大字 + 3D 球场 + 资历条）→ 品牌宣言与关键数据 → 成长轨迹（滚动驱动）→ 成绩榜（3D 倾斜主卡 + 成绩表）→ 影片室 → 四大训练支柱（交互球场图）→ 从冠军到教练 → 荣誉照片。
- Achievements：荣誉标签 → 成绩榜 → 成长轨迹 → 教练经历 → 教学理念 → 图集（灯箱保留）。
- Training：理念 → 训练方法（交互球场图）→ 适合人群阶梯 → 教学流程 → 教学视频库（技术主题筛选 + 排序，支持 `/training?topic=footwork#library` 链接）。
- Highlights：影片室头部 → 精选 → 吸顶筛选/排序工具条 → 视频网格 → 数据记分牌。
- Contact：统一的 Chalk 卡片、输入框与按钮。
