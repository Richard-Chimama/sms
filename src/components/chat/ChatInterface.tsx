'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { pusherClient } from '@/lib/pusher';

interface ChatUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  createdAt: Date;
  user: ChatUser;
}

interface ChatParticipant {
  user: ChatUser;
}

interface Chat {
  id: string;
  name: string | null;
  type: 'INDIVIDUAL' | 'GROUP' | 'CLASS';
  participants: ChatParticipant[];
  messages: ChatMessage[];
}

interface ChatInterfaceProps {
  chat: Chat;
  currentUserId: string;
}

export function ChatInterface({ chat: initialChat, currentUserId }: ChatInterfaceProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState(initialChat);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  useEffect(() => {
    pusherClient.subscribe(`chat-${chat.id}`);

    pusherClient.bind('new-message', (message: ChatMessage) => {
      setChat((currentChat) => ({
        ...currentChat,
        messages: [...currentChat.messages, message],
      }));
    });

    return () => {
      pusherClient.unsubscribe(`chat-${chat.id}`);
      pusherClient.unbind('new-message');
    };
  }, [chat.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chat.id,
          content: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setMessage('');
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
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">{getChatName()}</h2>
      </div>
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {chat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.user.id === currentUserId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.user.id === currentUserId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.user.id !== currentUserId && (
                  <div className="text-sm font-medium mb-1 text-foreground">
                    {msg.user.firstName && msg.user.lastName
                      ? `${msg.user.firstName} ${msg.user.lastName}`
                      : 'Unknown User'}
                  </div>
                )}
                <p className="break-words text-sm leading-relaxed">{msg.content}</p>
                <div className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
} 