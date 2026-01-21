
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import axios from 'axios';

// Helper to download image
async function downloadImage(url: string, folderPath: string): Promise<string | null> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];
        let extension = 'jpg';
        if (contentType) {
            if (contentType.includes('png')) extension = 'png';
            else if (contentType.includes('gif')) extension = 'gif';
            else if (contentType.includes('webp')) extension = 'webp';
            else if (contentType.includes('jpeg')) extension = 'jpg';
            else if (contentType.includes('svg')) extension = 'svg';
        }

        const urlPath = new URL(url).pathname;
        let filename = path.basename(urlPath);
        if (!filename || filename.length > 50 || !filename.includes('.')) {
             filename = `image-${Date.now()}-${Math.floor(Math.random() * 1000)}.${extension}`;
        }
        
        filename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        if (!path.extname(filename)) {
            filename = `${filename}.${extension}`;
        }

        const filePath = path.join(folderPath, filename);
        await fs.writeFile(filePath, response.data);
        return filename;
    } catch (error) {
        console.error(`Failed to download image: ${url}`, error instanceof Error ? error.message : String(error));
        return null;
    }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    let { slug, content, title, description, pubDate, tags, heroImage } = data;

    if (!slug || !content || !title) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
      });
    }

    // Process images in content
    const assetsDir = path.resolve(process.cwd(), 'src/assets/images');
    const postImagesDir = path.join(assetsDir, slug); // Create a folder per post
    
    // Ensure directory exists
    try {
        await fs.mkdir(postImagesDir, { recursive: true });
    } catch (e) {}

    // Regex to find images: ![]() or <img src="">
    // For simplicity, let's focus on Markdown images ![]()
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    const replacements = [];

    // Reset regex lastIndex just in case
    imgRegex.lastIndex = 0;

    // Find all matches first
    while ((match = imgRegex.exec(content)) !== null) {
        const alt = match[1];
        const src = match[2];
        replacements.push({ full: match[0], alt, src, index: match.index });
    }

    // Process replacements
    for (const rep of replacements) {
        let newSrc = rep.src;
        
        // Case 1: Remote URL (http/https)
        if (rep.src.startsWith('http')) {
            const filename = await downloadImage(rep.src, postImagesDir);
            if (filename) {
                newSrc = `../../assets/images/${slug}/${filename}`;
            }
        } 
        // Case 2: Local uploaded URL (/local-images/uploads/xxx) -> Move to post folder?
        // Or just point to it. Let's point to it but change path to relative
        // If it is /local-images/uploads/xxx, it maps to src/assets/images/uploads/xxx
        // We want it to be ../../assets/images/uploads/xxx relative to src/content/blog/xxx.md
        else if (rep.src.startsWith('/local-images/')) {
             // /local-images/uploads/foo.png -> ../../assets/images/uploads/foo.png
             newSrc = rep.src.replace('/local-images/', '../../assets/images/');
        }

        if (newSrc !== rep.src) {
            // Replace globally (simple approach, might be risky if same URL used twice but one is already replaced? No, string replace is safe if unique)
            // Better: use replaceAll
            content = content.split(rep.src).join(newSrc);
        }
    }

    // Process heroImage
    if (heroImage) {
        if (heroImage.startsWith('http')) {
            const filename = await downloadImage(heroImage, postImagesDir);
            if (filename) {
                heroImage = `../../assets/images/${slug}/${filename}`;
            }
        } else if (heroImage.startsWith('/local-images/')) {
            heroImage = heroImage.replace('/local-images/', '../../assets/images/');
        }
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
