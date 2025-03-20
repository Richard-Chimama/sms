'use server';

import { saveFile } from '@/lib/server/file-utils';

export async function uploadFile(file: File) {
  try {
    const fileUrl = await saveFile(file);
    return { success: true, url: fileUrl };
  } catch (error) {
    console.error('File upload error:', error);
    return { success: false, error: 'Failed to upload file' };
  }
} 