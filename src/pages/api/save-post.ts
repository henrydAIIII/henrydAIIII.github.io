
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { slug, content, title, description, pubDate, tags, heroImage } = data;

    if (!slug || !content || !title) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
      });
    }

    // 构建 Frontmatter
    const frontmatter = [
      '---',
      `title: '${title.replace(/'/g, "''")}'`,
      `description: '${(description || '').replace(/'/g, "''")}'`,
      `pubDate: '${pubDate || new Date().toISOString().split('T')[0]}'`,
      heroImage ? `heroImage: '${heroImage}'` : null,
      tags && tags.length ? `tags: ${JSON.stringify(tags)}` : null,
      '---',
      '',
      content
    ].filter(line => line !== null).join('\n');

    const filePath = path.join(process.cwd(), 'src/content/blog', `${slug}.md`);
    
    // 写入文件
    await fs.writeFile(filePath, frontmatter, 'utf-8');

    return new Response(JSON.stringify({ message: 'Saved successfully', path: filePath }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error saving post:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
};
