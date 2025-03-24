import { NextRequest, NextResponse } from 'next/server';
import { deleteFromCloudinary } from '@/lib/cloudinary-server';

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 });
    }

    const success = await deleteFromCloudinary(publicId);

    if (success) {
      return NextResponse.json({ message: 'Image deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 