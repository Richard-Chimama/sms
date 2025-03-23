'use client';

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './button';
import * as Avatar from '@radix-ui/react-avatar';

interface ImageCropperProps {
  file: File;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export function ImageCropper({ file, onCropComplete, onCancel }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Load the image
  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '');
    });
    reader.readAsDataURL(file);
  }, [file]);

  // Generate preview when crop changes
  const updatePreview = async (crop: PixelCrop) => {
    if (!imgRef.current || !crop) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    // Convert to blob and create preview URL
    canvas.toBlob((blob) => {
      if (blob) {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.95);
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set desired output size (e.g., 400x400 pixels)
    const outputWidth = 400;
    const outputHeight = 400;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Use better quality settings
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputWidth,
      outputHeight
    );

    // Convert to blob with high quality
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/jpeg',
      0.95 // High quality (95%)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => {
                setCompletedCrop(c);
                updatePreview(c);
              }}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Crop me"
                className="max-h-[400px] w-auto"
              />
            </ReactCrop>
          )}
        </div>
        <div className="w-[200px] flex flex-col items-center gap-4">
          <div className="text-sm font-medium">Preview</div>
          <Avatar.Root className="w-32 h-32 rounded-full overflow-hidden bg-muted">
            <Avatar.Image
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <Avatar.Fallback>Preview</Avatar.Fallback>
          </Avatar.Root>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleCropComplete}>Save</Button>
      </div>
    </div>
  );
} 