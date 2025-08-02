import { useAssignNextChat } from "@/hooks/useAgentChat.js";
import { useAgentChatStore } from "@/stores/agentChatStore.js";
import { Button } from "@/components/ui/button.js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.js";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AgentEmptyChatPage } from "./AgentEmptyChatPage";

export function AgentAssignNextChatButton() {
  const addChat = useAgentChatStore((s) => s.addChat);
  const setCurrentChat = useAgentChatStore((s) => s.setCurrentChat);
  const [error, setError] = useState<string | null>(null);

  const { mutate: assignChat, isPending } = useAssignNextChat();

  function handleAssign() {
    assignChat(undefined, {
      onSuccess: async (chat) => {
        
        console.log("hello")
        addChat(chat);
        setCurrentChat(chat.id);
        setError(null);
      },
      onError: (err) => {
        setError(err.message || "No chats available right now.");
      },
    });
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {error && (
        <div>
          <AgentEmptyChatPage />
          {/* <Alert variant="destructive" className="mt-2">
            <AlertTitle>No chats found</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert> */}
        </div>
      )}
      <Button
        variant="default"
        size="lg"
        disabled={isPending}
        onClick={handleAssign}
        className="w-full max-w-xs"
      >
        {isPending ? (
          <span>Assigning <Loader2 className="animate-spin w-4 h-4 mr-2" /></span>
        ) : (
          "Assign me a chat"
        )}
      </Button>
    </div>
  );
}
