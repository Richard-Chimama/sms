'use client';

import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateChatDialog } from './CreateChatDialog';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
  updatedAt: Date;
}

interface ChatListProps {
  chats: Chat[];
  currentUserId: string;
}

export function ChatList({ chats, currentUserId }: ChatListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getChatName = (chat: Chat) => {
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
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (!lastMessage) return 'No messages';
    const sender = lastMessage.user.id === currentUserId ? 'You' : 
      (lastMessage.user.firstName && lastMessage.user.lastName
        ? `${lastMessage.user.firstName} ${lastMessage.user.lastName}`
        : 'Unknown User');
    return `${sender}: ${lastMessage.content}`;
  };

  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-gray-100">Chats</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} variant="secondary">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {sortedChats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chats/${chat.id}`}
              className="block"
            >
              <div className={cn(
                "p-4 rounded-lg border border-gray-800 transition-colors",
                "hover:bg-gray-800/50 focus:bg-gray-800/50",
                "group"
              )}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-100 group-hover:text-gray-50">
                    {getChatName(chat)}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-1">
                  {getLastMessage(chat)}
                </p>
              </div>
            </Link>
          ))}
          {sortedChats.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No chats yet. Start a new conversation!
            </div>
          )}
        </div>
      </ScrollArea>
      <CreateChatDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
} 