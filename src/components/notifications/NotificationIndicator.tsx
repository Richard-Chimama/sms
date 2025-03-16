'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { pusherClient } from '@/lib/pusher';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'MESSAGE' | 'EXAM' | 'ASSIGNMENT' | 'NOTICE' | 'FEE' | 'ATTENDANCE';
  title: string;
  content: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
  sender: {
    firstName: string | null;
    lastName: string | null;
  };
}

export function NotificationIndicator() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    pusherClient.subscribe('notifications');

    pusherClient.bind('new-notification', (notification: Notification) => {
      setNotifications((current) => [notification, ...current]);
    });

    return () => {
      pusherClient.unsubscribe('notifications');
      pusherClient.unbind('new-notification');
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setIsOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b p-4">
          <h4 className="text-sm font-semibold">Notifications</h4>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)] max-h-80">
          <div className="space-y-1">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full text-left p-4 hover:bg-muted/50 transition-colors',
                    !notification.isRead && 'bg-muted/30'
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()} •{' '}
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 