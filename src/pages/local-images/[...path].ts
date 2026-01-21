
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const GET: APIRoute = async ({ params, request }) => {
  const url = new URL(request.url);
  // Extract path from URL since params might be tricky with [...name] sometimes
  // Expected URL: /local-images/subdir/image.png
  // Or /local-images/image.png
  // The route is src/pages/local-images/[...path].ts, so params.path should capture the rest
  
  const imagePath = params.path;
  
  if (!imagePath) {
    return new Response('Not Found', { status: 404 });
  }

  const fullPath = path.resolve(process.cwd(), 'src/assets/images', imagePath);

  // Security check: ensure we are still inside src/assets/images
  if (!fullPath.startsWith(path.resolve(process.cwd(), 'src/assets/images'))) {
     return new Response('Forbidden', { status: 403 });
  }

  try {
    const fileHandle = await fs.open(fullPath, 'r');
    const stat = await fileHandle.stat();
    const fileBuffer = await fileHandle.readFile();
    await fileHandle.close();

    // Determine mime type
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    return new Response('Not Found', { status: 404 });
  }
};
