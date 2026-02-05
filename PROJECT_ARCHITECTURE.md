# 项目架构文档 (Project Architecture Documentation)

## 1. 项目概述
本项目是一个基于 **Astro** 框架构建的静态/混合渲染博客网站，用于个人知识管理、文章发布和生活记录。项目托管在 GitHub 上，并通过 GitHub Pages 进行部署。

核心理念是**内容为王**，使用 Markdown/MDX 作为数据源，结合 React 组件提供必要的交互体验（如搜索、活动日历）。

## 2. 技术栈 (Tech Stack)

### 核心框架
- **Web 框架**: [Astro v5](https://astro.build/) (支持静态生成 SSG 和按需渲染)
- **UI 库**: React 19 (用于交互组件)
- **样式**: Tailwind CSS v4 (配合 `@tailwindcss/vite`)
- **语言**: TypeScript

### 内容管理
- **数据源**: 本地 Markdown (`.md`) 和 MDX (`.mdx`) 文件
- **内容集合**: Astro Content Collections (`src/content/blog`)
- **Markdown 处理**: `@astrojs/mdx`

### 功能依赖
- **搜索**: `fuse.js` (前端模糊搜索)
- **日历可视化**: `react-activity-calendar` (类似 GitHub 的贡献图)
- **文章抓取**: `jsdom`, `@mozilla/readability`, `turndown` (用于 `save-post` 脚本)
- **RSS & Sitemap**: `@astrojs/rss`, `@astrojs/sitemap`

## 3. 目录结构说明

```text
/
├── .github/workflows/   # GitHub Actions 自动部署配置
├── scripts/             # 工具脚本
│   └── save-post.js     # 文章抓取工具（Clipping Tool）
├── src/
│   ├── assets/          # 静态资源（图片等）
│   ├── components/      # 通用组件 (Astro 和 React 组件混用)
│   │   ├── Search.tsx   # 搜索组件 (React)
│   │   ├── Calendar.tsx # 活动日历 (React)
│   │   └── ...
│   ├── content/         # 内容存储
│   │   ├── blog/        # 博客文章 (.md/.mdx)
│   │   └── config.ts    # 内容集合 Schema 定义
│   ├── layouts/         # 页面布局模板
│   ├── pages/           # 页面路由
│   │   ├── api/         # API 路由
│   │   │   └── search.json.ts # 生成搜索索引的 API
│   │   ├── blog/        # 博客详情页和列表页
│   │   └── ...
│   └── styles/          # 全局样式
├── astro.config.mjs     # Astro 配置文件
├── package.json         # 项目依赖
└── tsconfig.json        # TypeScript 配置
```

## 4. 核心逻辑与数据流

### 4.1 内容渲染流程
1.  **数据定义**: 在 `src/content.config.ts` 中定义了 `blog` 集合的 Schema（包含 `title`, `pubDate`, `tags`, `location` 等字段）。
2.  **数据读取**: 使用 `astro:content` 的 `getCollection('blog')` API 读取所有 Markdown 文件。
3.  **页面生成**:
    -   `src/pages/blog/[...slug].astro`: 动态路由，根据文件名生成文章详情页。
    -   `src/pages/index.astro`: 首页，展示最新的文章和活动日历。

### 4.2 搜索机制 (Client-side Search)
1.  **索引生成**: `src/pages/api/search.json.ts` 遍历所有文章，生成一个包含标题、描述、标签和日期的 JSON 数据。
2.  **前端交互**: `src/components/Search.tsx` 组件在加载时（或用户交互时）请求 `/api/search.json`。
3.  **模糊匹配**: 使用 `Fuse.js` 在客户端对下载的 JSON 索引进行模糊搜索。
4.  **交互**: 支持 `Cmd/Ctrl + K` 快捷键唤起搜索框。

### 4.3 文章抓取工具 (CLI Tool)
-   **脚本**: `npm run save-post` (对应 `scripts/save-post.js`)
-   **功能**: 自动抓取指定 URL 的网页内容。
-   **流程**:
    1.  使用 `axios` 获取 HTML。
    2.  使用 `Readability` 解析正文。
    3.  使用 `turndown` 将 HTML 转换为 Markdown。
    4.  自动下载文章中的图片到本地 `src/assets/images`。
    5.  保存为 Markdown 文件到 `src/content/blog`。

## 5. 数据库说明

**当前状态**: 项目目前**未使用**任何关系型数据库（如 MySQL）。所有数据均存储在文件系统（Markdown）中。

**环境备注**:
用户提供了本地 MySQL 环境信息（账号 `root`，密码 `12345678`）。如果未来需要扩展功能（如动态评论、用户登录、复杂数据统计），可以集成 MySQL。但目前代码库中尚未集成相关 ORM 或连接逻辑。

## 6. 部署 (Deployment)

项目配置了 GitHub Actions (`.github/workflows/deploy.yml`)，当代码推送到 `main` 分支时，会自动构建并部署到 GitHub Pages。

-   **构建命令**: `npm run build`
-   **输出目录**: `dist/`

## 7. 待办与扩展 (Future Roadmap)

-   **Vditor 集成**: `package.json` 中包含 `vditor` 依赖，但目前代码中未使用。未来可能计划添加在线 Markdown 编辑器功能。
-   **数据库集成**: 可根据需求连接本地 MySQL，用于存储非静态内容。

---
*文档生成时间: 2026-02-05*
