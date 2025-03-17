'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Video, Link as LinkIcon, File } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pusherClient } from '@/lib/pusher';

interface Material {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'VIDEO' | 'LINK' | 'OTHER';
  url: string;
  createdAt: string;
  subjectId: string;
  teacherId: string;
  subject: {
    name: string;
  };
  class: {
    grade: number;
    section: string;
  };
  teacher?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface MaterialsListProps {
  teacherId?: string;
  classId?: string;
  subjectId?: string;
}

export default function MaterialsList({
  teacherId,
  classId,
  subjectId,
}: MaterialsListProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const params = new URLSearchParams();
        if (teacherId) params.append('teacherId', teacherId);
        if (classId) params.append('classId', classId);
        if (subjectId) params.append('subjectId', subjectId);

        const response = await fetch(`/api/materials?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch materials');
        const data = await response.json();
        setMaterials(data);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();

    // Subscribe to Pusher events
    const channel = pusherClient.subscribe('materials');
    
    channel.bind('new-material', (data: { material: Material; classId: string }) => {
      // Only add the material if it matches our current filters
      if (classId && data.classId !== classId) return;
      if (subjectId && data.material.subjectId !== subjectId) return;
      if (teacherId && data.material.teacherId !== teacherId) return;

      setMaterials(prev => [data.material, ...prev]);
    });

    return () => {
      channel.unbind('new-material');
      pusherClient.unsubscribe('materials');
    };
  }, [teacherId, classId, subjectId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-6 w-6" />;
      case 'VIDEO':
        return <Video className="h-6 w-6" />;
      case 'LINK':
        return <LinkIcon className="h-6 w-6" />;
      default:
        return <File className="h-6 w-6" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading materials...</div>;
  }

  if (materials.length === 0) {
    return <div className="text-center py-8 text-gray-500">No materials found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {materials.map((material) => (
        <Card key={material.id} className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              {getIcon(material.type)}
              <CardTitle className="text-gray-100">{material.title}</CardTitle>
            </div>
            <CardDescription>
              {material.subject.name} • {material.class ? `Grade ${material.class.grade}-${material.class.section}` : 'Class not specified'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">{material.description}</p>
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                className="text-gray-300 hover:text-gray-100"
                onClick={() => window.open(material.url, '_blank')}
              >
                {material.type === 'PDF' ? 'View PDF' : material.type === 'VIDEO' ? 'Watch Video' : 'Visit Link'}
              </Button>
              <span className="text-sm text-gray-400">
                Added {formatDistanceToNow(new Date(material.createdAt))} ago
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 