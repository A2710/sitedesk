// pages/Dashboard.tsx
import { useEffect } from "react";
import { AgentAssignNextChatButton } from "@/components/agentChat/AgentAssignNextChatButton.js";
import { AgentEmptyChatPage } from "@/components/agentChat/AgentEmptyChatPage.js";
import { AgentChatPage } from "@/components/agentChat/AgentChatPage.js";
import { useAgentChatStore } from "@/stores/agentChatStore.js";
import { useMyChats } from "@/hooks/useAgentChat.js";
import { socket, useAgentSocket } from "@/hooks/useAgentSocket";

export default function Dashboard() {
  useAgentSocket();

  const currentChatId  = useAgentChatStore(s => s.currentChatId);
  const setCurrentChat = useAgentChatStore(s => s.setCurrentChat);
  const setChats       = useAgentChatStore(s => s.setChats);

  const { data: myChats = [], isSuccess } = useMyChats("ACTIVE");

  useEffect(() => {
    if (!isSuccess) return;

    // always sync the list
    setChats(myChats);

    if (myChats.length > 0) {
      const firstId = myChats[0].id;
      setCurrentChat(firstId);
      socket?.emit("join_chat", { chatId: firstId });
    } else {
      setCurrentChat(null);
    }
  }, [isSuccess, myChats, currentChatId, setChats, setCurrentChat]);

  return currentChatId
    ? <AgentChatPage />
    : (
      <div className="flex items-center justify-center h-full w-full">
        <AgentAssignNextChatButton />
      </div>
    );
}
