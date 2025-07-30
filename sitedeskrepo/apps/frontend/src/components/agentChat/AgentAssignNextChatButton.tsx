import { useMutation } from '@tanstack/react-query';
import apiClient from '@/api/apiClient.js';
import { useAgentChatStore } from '@/stores/agentChatStore.js';
import { Chat } from '@repo/common/types';
import { Button } from "@/components/ui/button.js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.js";
import { useState } from "react";
import { Loader2 } from 'lucide-react';
// Optional: Add spinner from shadcn/ui, e.g., <Loader2 className="animate-spin" />

interface Props {
  onAssigned?: (chat: Chat) => void;
  onEmpty?: () => void;
}

export function AgentAssignNextChatButton({ onAssigned, onEmpty }: Props) {
  const addChat = useAgentChatStore((s) => s.addChat);
  const setCurrentChat = useAgentChatStore((s) => s.setCurrentChat);
  const [error, setError] = useState<string | null>(null);

  const { mutate: assignChat, isPending } = useMutation<Chat, Error, void>({
    mutationFn: async () => {
      const res = await apiClient.post('/agent/next-chat');
      if (res.status === 204 || !res.data.chat) throw new Error("No chats in the queue.");
      return res.data.chat as Chat;
    },
    onSuccess: (chat) => {
      addChat(chat);
      setCurrentChat(chat.id);
      setError(null);
      onAssigned?.(chat);
    },
    onError: (err) => {
      setError(err.message || "No chats available right now.");
      onEmpty?.();
    },
  });

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <Button
        variant="default"
        size="lg"
        disabled={isPending}
        onClick={() => assignChat()}
        className="w-full max-w-xs"
      >
        {isPending ? (
          <span>Assigning <Loader2 className="animate-spin w-4 h-4 mr-2" /></span>
        ) : (
          "Assign me a chat"
        )}
      </Button>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertTitle>No chats found</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
