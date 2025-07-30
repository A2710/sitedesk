import { Card, CardContent } from "@/components/ui/card.js";
import { useAgentChatStore } from "@/stores/agentChatStore.js";
import type { Chat } from "@repo/common/types";

export function AgentChatList() {
  const chatList = useAgentChatStore((s) => s.chatList);
  const currentChatId = useAgentChatStore((s) => s.currentChatId);
  const setCurrentChat = useAgentChatStore((s) => s.setCurrentChat);

  return (
    <Card className="w-60 min-w-[220px]">
      <CardContent className="p-2">
        <div className="font-semibold text-lg mb-2">Your Chats</div>
        <ul>
          {chatList.map((chat: Chat) => (
            <li
              key={chat.id}
              onClick={() => setCurrentChat(chat.id)}
              className={`rounded px-2 py-1 mb-1 cursor-pointer ${
                chat.id === currentChatId
                  ? "bg-primary/10 font-bold"
                  : "hover:bg-muted"
              }`}
            >
              Chat #{chat.id} ({chat.customer?.name || chat.customerId})
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
