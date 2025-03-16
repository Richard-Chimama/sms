'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ChatType } from '@prisma/client';

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface CreateChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChatDialog({ open, onOpenChange }: CreateChatDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [chatType, setChatType] = useState<ChatType>('INDIVIDUAL');
  const [chatName, setChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const handleCreate = async () => {
    if (chatType !== 'INDIVIDUAL' && !chatName.trim()) {
      toast.error('Please enter a chat name');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Please select at least one participant');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: chatType,
          name: chatType === 'INDIVIDUAL' ? null : chatName.trim(),
          participantIds: selectedUsers,
        }),
      });

      if (!response.ok) throw new Error('Failed to create chat');

      const chat = await response.json();
      router.push(`/chats/${chat.id}`);
      router.refresh();
      onOpenChange(false);
      toast.success('Chat created successfully');
    } catch (error) {
      toast.error('Failed to create chat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Chat Type</Label>
            <Select
              value={chatType}
              onValueChange={(value: ChatType) => setChatType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="GROUP">Group</SelectItem>
                <SelectItem value="CLASS">Class</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {chatType !== 'INDIVIDUAL' && (
            <div className="space-y-2">
              <Label>Chat Name</Label>
              <Input
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                placeholder="Enter chat name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Select Participants</Label>
            <ScrollArea className="h-[200px] border rounded-md p-4">
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={user.id}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        if (checked === true) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                        }
                      }}
                    />
                    <Label htmlFor={user.id} className="cursor-pointer">
                      {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'} ({user.role})
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 