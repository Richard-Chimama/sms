import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uniqueId = uuidv4();
  const extension = file.name.split('.').pop();
  const fileName = `${uniqueId}.${extension}`;
  const path = join(process.cwd(), 'public/uploads', fileName);

  await writeFile(path, buffer);
  return `/uploads/${fileName}`;
} 