import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary environment variables');
}

// Configure Cloudinary - server-side only
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}

interface CloudinaryUploadResult {
  url: string;
  public_id: string;
}

export async function uploadToCloudinaryServer(
  buffer: Buffer,
  options: {
    folder?: string;
    resource_type?: "image" | "video" | "raw" | "auto";
    public_id?: string;
  } = {}
): Promise<CloudinaryUploadResult> {
  try {
    // Convert Buffer to base64 data URI
    const base64Data = buffer.toString('base64');
    const dataUri = `data:application/octet-stream;base64,${base64Data}`;

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        {
          folder: options.folder || 'general',
          resource_type: options.resource_type || 'auto',
          public_id: options.public_id,
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('No result from Cloudinary'));
        }
      );
    });

    return {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}

// Export the configured instance for advanced usage
export { cloudinary }; 