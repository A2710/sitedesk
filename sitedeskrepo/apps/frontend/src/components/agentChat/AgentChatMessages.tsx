import { ScrollArea } from "@/components/ui/scroll-area.js";
import { useAgentChatStore } from "@/stores/agentChatStore.js";
import type { Message } from "@repo/common/types";

interface Props { chatId: number | null; }

export function AgentChatMessages({ chatId }: Props) {
  const messages = useAgentChatStore(
    (s) => (chatId ? s.messagesByChatId[chatId] || [] : [])
  );
  return (
    <ScrollArea className="h-80 border rounded-md p-2 w-full">
      {messages.length === 0 && (
        <div className="text-muted-foreground">No messages yet.</div>
      )}
      {messages.map((msg: Message, idx) => (
        <div key={msg.id || idx} className="mb-2">
          <span className="font-semibold">{msg.senderType}:</span>{" "}
          <span>{msg.content}</span>
        </div>
      ))}
    </ScrollArea>
  );
}
