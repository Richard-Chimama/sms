'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { pusherClient } from '@/lib/pusher';
import { Send } from 'lucide-react';
import { ChatType } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface ChatUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

interface ChatParticipant {
  id: string;
  userId: string;
  chatId: string;
  role: string;
  user: ChatUser;
}

interface ChatMessage {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  chatId: string;
  user: ChatUser;
}

interface Chat {
  id: string;
  name: string | null;
  type: ChatType;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  updatedAt: Date;
}

interface ChatInterfaceProps {
  chat: Chat;
  currentUserId: string;
}

export function ChatInterface({ chat, currentUserId }: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(chat.messages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = pusherClient.subscribe(`chat-${chat.id}`);

    channel.bind('new-message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      pusherClient.unsubscribe(`chat-${chat.id}`);
    };
  }, [chat.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const getChatName = () => {
    if (chat.type !== 'INDIVIDUAL' && chat.name) {
      return chat.name;
    }
    const otherParticipant = chat.participants.find(
      (p) => p.user.id !== currentUserId
    );
    if (!otherParticipant) return 'Chat';
    return otherParticipant.user.firstName && otherParticipant.user.lastName
      ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
      : 'Unknown User';
  };

  const getLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) {
      return 'No messages yet';
    }
    const lastMessage = chat.messages[0];
    return `${lastMessage.user.firstName || ''} ${lastMessage.user.lastName || ''}`.trim() + `: ${lastMessage.content}`;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chat.id,
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
      router.refresh();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{getChatName()}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea
          ref={scrollAreaRef}
          className="flex-1 pr-4"
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.user.id === currentUserId
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.user.id === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.user.id !== currentUserId && (
                    <div className="text-sm text-black font-medium mb-1">
                      {message.user.firstName && message.user.lastName
                        ? `${message.user.firstName} ${message.user.lastName}`
                        : 'Unknown User'}
                    </div>
                  )}
                  <p className="break-words text-black">{message.content}</p>
                  <div className="text-xs mt-1 opacity-70 text-black">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 mt-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 text-black"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 