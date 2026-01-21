
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = (formData.get('file') || formData.get('file[]')) as File;

    if (!file) {
      return new Response(JSON.stringify({ msg: 'No file found', code: 1 }), { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name}`;
    // Change upload directory to src/assets/images/uploads
    const uploadDir = path.resolve(process.cwd(), 'src/assets/images/uploads');

    try {
        await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
        // Ignore if directory exists
    }

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, Buffer.from(buffer));

    // Return format expected by Vditor
    // Use local-images endpoint for preview
    return new Response(JSON.stringify({
      msg: 'Success',
      code: 0,
      data: {
        errFiles: [],
        succMap: {
          [file.name]: `/local-images/uploads/${fileName}`
        }
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ msg: `Server Error: ${errorMessage}`, code: 1 }), { status: 500 });
  }
}
