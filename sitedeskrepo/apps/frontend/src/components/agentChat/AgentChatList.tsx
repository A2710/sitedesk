import { Card, CardContent } from "@/components/ui/card.js";
import { socket } from "@/hooks/useAgentSocket";
import { useAgentChatStore } from "@/stores/agentChatStore.js";
import type { Chat } from "@repo/common/types";

export function AgentChatList() {
  const chatList = useAgentChatStore((s) => s.chatList);

  const currentChatId = useAgentChatStore((s) => s.currentChatId);

  const setCurrentChat = useAgentChatStore((s) => s.setCurrentChat);

  void function handleOnClick(chat: Chat) {
    if (currentChatId) {
      socket?.emit("leave_chat", { chatId: currentChatId });
    }
    setCurrentChat(chat.id);
    if (currentChatId)
    {
      socket?.emit("join_chat", {currentChatId});
    }
  }

  return (
    <Card className="w-60 min-w-[220px]">
      <CardContent className="p-2 pt-0">
        <div className="font-extrabold text-center text-lg mb-2">Your Chats</div>
        <ul>
          {chatList.map((chat: Chat) => (
            <li
              key={chat.id}
              onClick={() => setCurrentChat(chat.id)}
              className={`rounded px-2 py-1 mb-1 cursor-pointer flex-col ${
                chat.id === currentChatId
                  ? "bg-gray-200 font-bold"
                  : "hover:bg-muted"
              }`}
            >
              <div className="font-extrabold text-gray-500 text-xs">#{chat.id}</div> 
              <div>{chat.customer?.name?.toUpperCase() || chat.customerId}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
