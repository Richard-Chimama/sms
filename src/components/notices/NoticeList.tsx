'use client';

import { useEffect, useState, useRef } from 'react';
import { NoticeCategory } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { PinIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

type NoticeComment = {
  id: string;
  content: string;
  createdAt: string | Date;
  author: {
    firstName: string | null;
    lastName: string | null;
  };
};

type Notice = {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  pinned: boolean;
  createdAt: string | Date;
  expiresAt: string | Date | null;
  author: {
    firstName: string | null;
    lastName: string | null;
  };
  comments?: NoticeComment[];
};

type NoticeListProps = {
  notices: Notice[];
  userRole?: string;
  category?: NoticeCategory;
  activeOnly?: boolean;
};

export default function NoticeList({ notices: initialNotices, userRole, category, activeOnly = true }: NoticeListProps) {
  const { data: session } = useSession();
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [submittingComment, setSubmittingComment] = useState<{ [key: string]: boolean }>({});
  const searchParams = useSearchParams();
  const highlightedNoticeId = searchParams.get('highlight');
  const highlightedNoticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotices(initialNotices);
  }, [initialNotices]);

  useEffect(() => {
    if (highlightedNoticeId && highlightedNoticeRef.current) {
      highlightedNoticeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedNoticeId]);

  useEffect(() => {
    if (!category) return;

    const fetchNotices = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('category', category);
        if (activeOnly) params.append('active', 'true');

        const response = await fetch(`/api/notices?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch notices');

        const data = await response.json();
        setNotices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notices');
        // Keep showing the existing notices if there's an error
        setNotices(initialNotices);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [category, activeOnly, initialNotices]);

  const handleCommentChange = (noticeId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [noticeId]: value }));
  };

  const handleSubmitComment = async (noticeId: string) => {
    const content = commentInputs[noticeId];
    if (!content?.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setSubmittingComment((prev) => ({ ...prev, [noticeId]: true }));
      const response = await fetch(`/api/notices/${noticeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const newComment = await response.json();
      setNotices((prevNotices) =>
        prevNotices.map((notice) =>
          notice.id === noticeId
            ? {
                ...notice,
                comments: [newComment, ...(notice.comments || [])],
              }
            : notice
        )
      );
      setCommentInputs((prev) => ({ ...prev, [noticeId]: '' }));
      toast.success('Comment posted successfully');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [noticeId]: false }));
    }
  };

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

  const getCategoryColor = (category: NoticeCategory): string => {
    const baseClasses = "text-white";
    switch (category) {
      case NoticeCategory.GENERAL:
        return cn(baseClasses, "bg-blue-500");
      case NoticeCategory.STUDENT:
        return cn(baseClasses, "bg-green-500");
      case NoticeCategory.TEACHER:
        return cn(baseClasses, "bg-purple-500");
      case NoticeCategory.PARENT:
        return cn(baseClasses, "bg-orange-500");
      case NoticeCategory.EXAM:
        return cn(baseClasses, "bg-red-500");
      case NoticeCategory.EVENT:
        return cn(baseClasses, "bg-yellow-500");
      default:
        return cn(baseClasses, "bg-gray-500");
    }
  };

  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <Card 
          key={notice.id} 
          className={cn(
            "relative transition-colors duration-300",
            notice.id === highlightedNoticeId && "bg-muted/50 ring-2 ring-primary"
          )}
          ref={notice.id === highlightedNoticeId ? highlightedNoticeRef : null}
        >
          {notice.pinned && (
            <div className="absolute top-2 right-2">
              <PinIcon className="h-4 w-4 text-blue-500" />
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(notice.category)}>
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
            
            {/* Comments section */}
            <div className="mt-4 space-y-4">
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-2">Comments</h4>
                {session?.user && (
                  <div className="flex gap-2 mb-4">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentInputs[notice.id] || ''}
                      onChange={(e) => handleCommentChange(notice.id, e.target.value)}
                      className="min-h-[60px] bg-gray-800 border-gray-700 text-white"
                    />
                    <Button
                      onClick={() => handleSubmitComment(notice.id)}
                      disabled={submittingComment[notice.id]}
                    >
                      {submittingComment[notice.id] ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                )}
                <div className="space-y-2 ">
                  {notice.comments?.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-800 border border-white rounded">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-muted-foreground text-white">
                          {comment.author.firstName} {comment.author.lastName} ·{' '}
                          {format(new Date(comment.createdAt), 'PPP')}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-white">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 