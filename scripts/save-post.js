
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CONTENT_DIR = path.resolve(__dirname, '../src/content/blog');
const ASSETS_DIR = path.resolve(__dirname, '../src/assets/images');

async function downloadImage(url, folderPath) {
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

        // Generate a filename based on the URL hash or timestamp to avoid collisions
        // Simple approach: use the basename if possible, or a hash
        const urlPath = new URL(url).pathname;
        let filename = path.basename(urlPath);
        if (!filename || filename.length > 50 || !filename.includes('.')) {
             filename = `image-${Date.now()}-${Math.floor(Math.random() * 1000)}.${extension}`;
        }
        
        // Clean filename
        filename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        // If extension is missing in filename, append it
        if (!path.extname(filename)) {
            filename = `${filename}.${extension}`;
        }

        const filePath = path.join(folderPath, filename);
        await fs.writeFile(filePath, response.data);
        return filename;
    } catch (error) {
        console.error(`Failed to download image: ${url}`, error.message);
        return null;
    }
}

async function saveArticle(url) {
    console.log(`Fetching ${url}...`);
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
            }
        });
        
        const dom = new JSDOM(response.data, { url });
        const doc = dom.window.document;
        const reader = new Readability(doc);
        const article = reader.parse();

        if (!article) {
            throw new Error('Could not parse article content');
        }

        console.log(`Title: ${article.title}`);

        // Try to extract tags
        let tags = [];
        const metaTags = doc.querySelectorAll('meta[property="article:tag"], meta[name="keywords"]');
        metaTags.forEach(meta => {
            const content = meta.getAttribute('content');
            if (content) {
                if (content.includes(',')) {
                    tags.push(...content.split(',').map(t => t.trim()));
                } else {
                    tags.push(content.trim());
                }
            }
        });
        
        // Remove duplicates and empty strings
        tags = [...new Set(tags)].filter(t => t);
        if (tags.length === 0) tags = ['imported'];

        // Try to extract date
        let pubDate = new Date().toISOString().split('T')[0];
        const dateMeta = doc.querySelector('meta[property="article:published_time"], meta[name="date"], meta[name="pubdate"]');
        if (dateMeta) {
            const content = dateMeta.getAttribute('content');
            if (content) {
                try {
                    pubDate = new Date(content).toISOString().split('T')[0];
                } catch (e) {
                    console.warn('Could not parse date:', content);
                }
            }
        }

        // Create slug
        const slug = article.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove non-word chars
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/^-+|-+$/g, '') || 'untitled';

        const folderName = slug; // We can use slug as folder name for images
        const imageOutputDir = path.join(ASSETS_DIR, folderName);
        
        // Ensure directories exist
        await fs.mkdir(imageOutputDir, { recursive: true });

        // Setup Turndown
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        });

        // Custom rule to handle images
        const imagesToDownload = [];
        
        turndownService.addRule('images', {
            filter: 'img',
            replacement: function (content, node) {
                const src = node.getAttribute('src');
                const alt = node.getAttribute('alt') || '';
                if (src) {
                    // Resolve relative URLs
                    const absoluteUrl = new URL(src, url).href;
                    imagesToDownload.push({ src: absoluteUrl, alt });
                    return `![${alt}](./image-placeholder-${imagesToDownload.length - 1})`;
                }
                return '';
            }
        });

        let markdown = turndownService.turndown(article.content);

        // Download images and replace placeholders
        console.log(`Found ${imagesToDownload.length} images. Downloading...`);
        
        let heroImage = '';
        
        for (let i = 0; i < imagesToDownload.length; i++) {
            const { src, alt } = imagesToDownload[i];
            const filename = await downloadImage(src, imageOutputDir);
            
            if (filename) {
                const relativePath = `../../assets/images/${folderName}/${filename}`;
                markdown = markdown.replace(`![${alt}](./image-placeholder-${i})`, `![${alt}](${relativePath})`);
                
                // Use the first image as hero image
                if (i === 0) {
                    heroImage = relativePath;
                }
            } else {
                // If download failed, keep original link or remove? 
                // Let's keep original link as fallback but warn
                markdown = markdown.replace(`![${alt}](./image-placeholder-${i})`, `![${alt}](${src})`);
            }
        }

        // Create Frontmatter
        const frontmatter = [
            '---',
            `title: '${article.title.replace(/'/g, "''")}'`,
            `description: '${article.excerpt ? article.excerpt.replace(/'/g, "''").replace(/\n/g, ' ') : ''}'`,
            `pubDate: '${pubDate}'`,
            heroImage ? `heroImage: '${heroImage}'` : `heroImage: '../../assets/blog-placeholder-3.jpg'`, // Default placeholder if no image
            `tags: ${JSON.stringify(tags)}`,
            '---',
            '',
            ''
        ].join('\n');

        const finalContent = frontmatter + markdown;
        
        const outputPath = path.join(CONTENT_DIR, `${slug}.md`);
        await fs.writeFile(outputPath, finalContent);
        
        console.log(`Saved article to ${outputPath}`);
        console.log(`Images saved to ${imageOutputDir}`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

const url = process.argv[2];
if (!url) {
    console.error('Please provide a URL');
    process.exit(1);
}

saveArticle(url);
