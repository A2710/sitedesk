import { useState } from "react";
import { AgentAssignNextChatButton } from "@/components/agentChat/AgentAssignNextChatButton.js";
import { AgentEmptyChatPage } from "@/components/agentChat/AgentEmptyChatPage.js";
import { AgentChatPage } from "@/components/agentChat/AgentChatPage.js";
import { useAgentChatStore } from "@/stores/agentChatStore.js";

export default function Dashboard() {
  const currentChatId = useAgentChatStore((s) => s.currentChatId);
  const [showEmpty, setShowEmpty] = useState(false);

  if (currentChatId) return <AgentChatPage />;
  if (showEmpty) return <AgentEmptyChatPage />;

  return (
    <div className="flex items-center justify-center h-full w-full">
      <AgentAssignNextChatButton
        onAssigned={() => setShowEmpty(false)}
        onEmpty={() => setShowEmpty(true)}
      />
    </div>
  );
}
