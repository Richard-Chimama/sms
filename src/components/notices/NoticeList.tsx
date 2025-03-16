import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { NoticeCategory } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { PinIcon } from 'lucide-react';

type Notice = {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  pinned: boolean;
  createdAt: string;
  expiresAt: string | null;
  author: {
    firstName: string;
    lastName: string;
  };
};

type NoticeListProps = {
  category?: NoticeCategory;
  activeOnly?: boolean;
};

export default function NoticeList({ category, activeOnly = true }: NoticeListProps) {
  const { data: session } = useSession();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (activeOnly) params.append('active', 'true');

        const response = await fetch(`/api/notices?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch notices');

        const data = await response.json();
        setNotices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notices');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [category, activeOnly]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No notices found.
      </div>
    );
  }

  const getCategoryColor = (category: NoticeCategory) => {
    switch (category) {
      case NoticeCategory.GENERAL:
        return 'bg-blue-500';
      case NoticeCategory.STUDENT:
        return 'bg-green-500';
      case NoticeCategory.TEACHER:
        return 'bg-purple-500';
      case NoticeCategory.PARENT:
        return 'bg-orange-500';
      case NoticeCategory.EXAM:
        return 'bg-red-500';
      case NoticeCategory.EVENT:
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <Card key={notice.id} className="relative">
          {notice.pinned && (
            <div className="absolute top-2 right-2">
              <PinIcon className="h-4 w-4 text-blue-500" />
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className={`${getCategoryColor(notice.category)} text-white`}>
                {notice.category}
              </Badge>
              <CardTitle>{notice.title}</CardTitle>
            </div>
            <CardDescription>
              Posted by {notice.author.firstName} {notice.author.lastName} on{' '}
              {format(new Date(notice.createdAt), 'PPP')}
              {notice.expiresAt && (
                <> · Expires on {format(new Date(notice.expiresAt), 'PPP')}</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{notice.content}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 