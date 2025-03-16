'use client';

import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateChatDialog } from './CreateChatDialog';
import { useState } from 'react';

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
    return lastMessage.content;
  };

  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Chats</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {sortedChats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chats/${chat.id}`}
              className="block"
            >
              <div className="p-4 rounded-lg hover:bg-muted transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">{getChatName(chat)}</h3>
                  <span className="text-xs text-black text-muted-foreground">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground text-black truncate">
                  {getLastMessage(chat)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <CreateChatDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
} 