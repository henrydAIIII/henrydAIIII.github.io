---
title: '👋 你好，世界！这是我的第一篇博客'
description: '这是一篇示例文章，教你如何使用 Markdown 撰写博客，添加图片和标签。'
pubDate: '2024-01-21'
heroImage: '../../assets/blog-placeholder-about.jpg'
tags: ["教程", "生活", "Astro"]
---

欢迎来到你的新博客！这篇文章既是你的第一篇内容，也是一份**使用指南**。

## 1. 怎么写新文章？

在你的项目文件夹里，找到 `src/content/blog/` 目录。在这里创建一个新的 `.md` 文件（例如 `my-story.md`），你就已经开始写文章了！

### 文件头（Frontmatter）

每篇文章的开头必须包含一段元数据，用三根短横线包裹，像这样：

```yaml
---
title: '这里写文章标题'
description: '这里写一段简短的描述，会显示在文章列表里'
pubDate: '2024-01-21'
heroImage: '../../assets/blog-placeholder-1.jpg'
tags: ["标签1", "标签2"]
---
```

*   **title**: 文章标题。
*   **description**: 文章简介。
*   **pubDate**: 发布日期。
*   **heroImage**: 封面图片路径。你可以把图片放在 `src/assets/` 里，然后引用它。
*   **tags**: 标签列表，用来给文章分类。

## 2. Markdown 语法演示

写作非常简单，就像写普通文本一样。

### 文本样式

你可以使用 **加粗**，*斜体*，或者 ~~删除线~~。

### 引用

> “千里之行，始于足下。”
>
> — 老子

### 列表

**无序列表：**

*   苹果 🍎
*   香蕉 🍌
*   橘子 🍊

**有序列表：**

1.  第一步：打开电脑
2.  第二步：开始写作
3.  第三步：发布博客

### 代码块

如果你是程序员，可以插入代码块：

```javascript
console.log('Hello, World!');
```

### 插入图片

你可以直接在文章中插入图片：

![Astro logo](../../assets/blog-placeholder-1.jpg)

## 3. 如何发布？

写完文章后，只需要将代码推送到 GitHub：

```bash
git add .
git commit -m "添加了新文章"
git push
```

稍等几分钟，你的网站就会自动更新了！🎉
