# AGENTS.md

本仓库是基于 Astro（静态站点框架）和 Firefly（Astro 博客模板）的个人博客。协作时优先保持改动小、语义明确、可直接验证，并贴合当前项目结构，不再沿用旧 Hexo（静态博客生成器）/ Fluid（Hexo 主题）路径与字段。

## 基本约定

- 查询库、框架、SDK（软件开发工具包）、API（应用程序接口）、CLI（命令行工具）或云服务文档时，使用 Context7（开发文档检索工具）获取当前文档：先运行 `npx ctx7@latest library <name> "<question>"` 解析库 ID，再运行 `npx ctx7@latest docs <libraryId> "<question>"` 获取文档；即使是 Astro（静态站点框架）、Svelte（前端组件框架）、Tailwind CSS（CSS 工具框架）、Biome（格式化与代码检查工具）、Pagefind（静态站点搜索索引工具）这类常见项目，也不要只凭记忆回答。
- 写代码和脚本时遵循模块化、组件化、高内聚低耦合、单一职责，同时保持简洁、高效、可读。
- 不写兜底代码、冗余代码、猜测性代码。不清楚字段、接口或数据语义时先询问，不要写多套猜测字段名。
- 遵循「宁缺毋滥」：优先保留真实失败或 pending（待处理）状态并记录日志，不要为了「尽量有结果」伪造结果、伪造终态或引入语义污染的 fallback（兜底降级）。
- 不要过度防御性编程；只处理当前需求真实需要的异常和边界。

## 项目结构

- 文章位于 `src/content/posts/`。当前常见形态是 `src/content/posts/<slug>/index.md` 或 `index.mdx`，文章私有图片放在同级目录，例如 `cover.webp` 或 `images/`。
- 专用页面内容位于 `src/content/spec/`，例如关于页、友链页和留言板说明内容。
- 站点配置位于 `src/config/`，并通过 `src/config/index.ts` 统一导出。配置文件只放结构化配置数据；可复用逻辑放到 `src/utils/`，不要把工具函数塞进配置文件。
- 页面入口位于 `src/pages/`，布局位于 `src/layouts/`，组件位于 `src/components/`，通用工具位于 `src/utils/`，类型定义位于 `src/types/`。
- `public/` 放不需要 Astro 构建优化、需要原路径访问的静态资源；`src/assets/` 放需要被 Astro 处理或导入的资源。
- 路由优先遵循 Firefly/Astro 当前默认结构；除非用户明确要求，不主动添加旧 Hexo URL（旧博客链接地址）兼容层。

## 内容与文档

- 文章使用 Astro Content Collections（Astro 内容集合）管理，字段以 `src/content.config.ts` 的 schema（结构约束）为准。
- 新增或修改文章时，优先使用这些 front matter（文件头元数据）字段：`title`、`published`、`draft`、`description`、`image`、`tags`、`category`、`updated`、`comment`、`password`、`passwordHint`。
- 发布文章的封面统一放在文章目录内，命名为 `cover.webp`，并在文章 front matter 中写 `image: ./cover.webp`。不要再写旧 Hexo/Fluid 的 `index_img` 和 `banner_img`。
- 草稿通过 `draft: true` 标记；批量处理发布内容时，不要把草稿误当作已发布文章。
- 生成计划、报告、总结或说明文档时，所有项目专有名词、缩写、技术术语或英文概念首次出现都要提供中文解释或注释。
- 避免堆砌英文术语。优先使用简洁中文表达，必要时把英文名词放在括号中说明。
- 中英文、中文与数字之间保持适当空格；中文语境优先使用全角标点。

## 博客封面

- 发布文章的最终封面统一放在对应文章目录内，例如 `src/content/posts/zap/cover.webp`。
- 文章最终上线引用 WebP 文件。每篇发布文章的 front matter（文件头元数据）都应配置：

```yaml
image: ./cover.webp
```

- `image` 用于文章列表卡片图和文章页头图，Firefly 会读取这个字段。
- 封面生成阶段保持原始规格：先生成 PNG 原图，命名为 `cover.png`，放在对应文章目录内。不要在生成阶段自行转 WebP（网页图片压缩格式），也不要在文件名里加入 `raw` 标记。
- 只有在用户明确说明「已经手动转为 WebP」并要求替换路径后，才把 `cover.webp` 作为最终文件，并同步替换或确认文章中的 `image: ./cover.webp` 引用。
- 若新增文章还没有 WebP 版本，先保留 PNG 原图和文章引用缺口，提醒用户手动转 WebP；不要为了让页面立即有图而擅自把文章路径指向 `.png` 或自行压缩转码。如果文章已预留 `image: ./cover.webp` 但文件尚不存在，要在交付中明确列为待处理缺口。
- 封面风格保持「日系二次元柔和彩色线稿」：暖色学习桌或开发场景、柔和光照、技术关键词或图标化元素、专业博客封面构图。
- 生成封面时默认一篇文章对应一张专属图，图中应体现该篇文章的关键词、主题或关键技术栈图标，不使用泛用封面糊弄过去。
- 封面文字只允许中文或英文。避免日文、韩文、西里尔文、伪语言、乱码、水印、签名和二维码。
- 不依赖模型在封面中生成完整文章标题；封面优先承载视觉主题、技术符号和少量可靠短词，完整标题交给页面文本呈现。
- 优先使用 16:9 宽屏构图；当前系列尺寸为 `1672x941`，新增封面尽量保持接近比例。
- 生成图片后复制到项目目录，保留 Codex 默认生成目录中的原始文件；不要覆盖已有封面，除非用户明确要求替换。需要试新版本时使用版本化文件名，例如 `cover.candidate.png`。
- 审查图只作为临时检查产物，检查完成后删除，不要提交：
  - 单图缩略审查文件：`src/content/posts/<slug>/cover.review.jpg`
  - 总览审查图：`src/content/posts/_cover_review_contact_sheet.jpg`

## 配置与功能边界

- 站点基础信息、导航、分页、页面开关、图像优化、统计分析等优先改 `src/config/siteConfig.ts`。
- 友链、相册、赞助、公告、侧边栏、页脚、评论、音乐、字体、特效、封面随机图等功能分别维护在 `src/config/*Config.ts`，不要跨配置文件混写。
- `siteConfig.generateOgImages` 控制 Open Graph（社交分享预览）图片生成，会影响 `/og/<slug>.png` 路由和页面 `<meta property="og:image">`。它不是文章正文或文章卡片封面开关。
- Umami（网站访问统计工具）已经通过 `src/components/analytics/UmamiAnalytics.astro` 和 `src/layouts/Layout.astro` 接入；修改统计配置时优先改 `siteConfig.analytics.umamiAnalytics`。
- 页面访问开关以 `siteConfig.pages` 为准；关闭页面时也要注意 `astro.config.mjs` 中站点地图（sitemap）过滤逻辑。

## 开发与验证

- 本项目使用 `pnpm` 作为包管理器，`package.json` 中有 `preinstall` 限制；不要改用 `npm install` 或 `yarn install`。
- 本地开发使用 `pnpm dev`，预览构建产物使用 `pnpm preview`。
- 交付前根据改动范围运行验证：
  - 内容或配置改动：至少运行 `pnpm check`。
  - 样式、组件、脚本或页面逻辑改动：运行 `pnpm check` 和 `pnpm build`。
  - 改动文章封面后，检查所有已发布文章的 `src/content/posts/*/index.md` 或 `index.mdx` 是否配置 `image: ./cover.webp`，引用的 `cover.webp` 是否真实存在，并确认审查图中没有漏图、明显错字、乱码或中英文以外文字。
  - 需要检查格式或静态规则时运行 `pnpm lint`；注意该脚本会写入格式化结果。
- `pnpm build` 会先执行图标生成脚本，再执行 Astro 构建，最后生成 Pagefind（站内搜索索引）数据；构建失败时保留真实错误，不要伪造成功状态。
- 若清理本地开发或预览进程，优先检查 4321 端口及 `astro dev`、`astro preview`、`pnpm dev`、`pnpm preview` 对应进程，确认后再停止。
