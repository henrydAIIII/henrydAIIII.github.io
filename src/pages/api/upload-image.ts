
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file[]') as File; // Vditor sends file[] by default

    if (!file) {
      return new Response(JSON.stringify({ msg: 'No file found', code: 1 }), { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name}`;
    const uploadDir = path.resolve(process.cwd(), 'public/uploads');

    try {
        await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
        // Ignore if directory exists
    }

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, Buffer.from(buffer));

    // Return format expected by Vditor
    return new Response(JSON.stringify({
      msg: 'Success',
      code: 0,
      data: {
        errFiles: [],
        succMap: {
          [file.name]: `/uploads/${fileName}`
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
    return new Response(JSON.stringify({ msg: 'Server Error', code: 1 }), { status: 500 });
  }
}
