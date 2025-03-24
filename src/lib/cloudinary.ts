// Client-side configuration
const cloudConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
};

if (!cloudConfig.cloudName || !cloudConfig.apiKey || !cloudConfig.uploadPreset) {
  throw new Error('Missing Cloudinary environment variables');
}

// Client-side upload function
export async function uploadToCloudinary(file: File, folder: string = 'general'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudConfig.uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudConfig.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.secure_url;
}

// Client-side delete function
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const response = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete image');
  }
}

export function getPublicIdFromUrl(url: string): string {
  // Extract public ID from Cloudinary URL
  const matches = url.match(/\/v\d+\/([^/]+)\.\w+$/);
  if (!matches) {
    throw new Error('Invalid Cloudinary URL');
  }
  return matches[1];
} 