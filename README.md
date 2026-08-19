# MyBlog

个人博客，基于 Next.js + Contentlayer2 + Cloudflare Pages。

## 技术栈

- [Next.js 15](https://nextjs.org/) - React 框架
- [Tailwind CSS v4](https://tailwindcss.com/) - 样式
- [Contentlayer2](https://www.contentlayer.dev/) - MDX 内容管理
- [next-themes](https://github.com/pacocoursey/next-themes) - 主题切换
- [Framer Motion](https://www.framer.com/motion/) - 动画

## 本地开发

```bash
npm install
npm run dev
```

## 写文章

在 `content/posts/` 目录下创建 `.mdx` 文件：

```mdx
---
title: 文章标题
description: 文章描述
date: 2025-01-01
tags: [标签1, 标签2]
---

正文内容...
```

## 写项目介绍

在 `content/projects/` 目录下创建 `.mdx` 文件：

```mdx
---
title: 项目名称
description: 项目描述
tags: [React, TypeScript]
github: https://github.com/xxx/xxx
status: active
---

项目详情...
```

## 自定义组件

在文章中可以使用以下组件：

- `<Screenshot images={["url1", "url2"]} />` - 图片轮播
- `<CodeDemo code="..." language="typescript" title="标题" />` - 代码展示

## 部署

推送到 `main` 分支会自动通过 GitHub Actions 部署到 Cloudflare Pages。
