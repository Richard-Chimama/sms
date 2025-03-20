'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
  onUpload: (url: string) => void;
  onDelete?: () => void;
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  currentUrl?: string;
  isImage?: boolean;
}

export function FileUpload({
  onUpload,
  onDelete,
  folder = 'general',
  accept = 'image/*',
  maxSize = 5,
  label = 'Upload File',
  currentUrl,
  isImage = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Check file type
    if (!file.type.match(accept.replace('*', '.*'))) {
      setError('Invalid file type');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadToCloudinary(file, folder);
      onUpload(url);
    } catch (error) {
      setError('Failed to upload file');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">{label}</Label>
      {currentUrl && isImage && (
        <div className="relative w-32 h-32">
          <Image
            src={currentUrl}
            alt="Current file"
            fill
            className="object-cover rounded-md"
          />
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2"
              onClick={onDelete}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 