import { AgentChatList } from "./AgentChatList.js";
import { AgentChatMessages } from "./AgentChatMessages.js";
import { AgentChatInput } from "./AgentChatInput.js";
import { useAgentChatStore } from "@/stores/agentChatStore.js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.js";

export function AgentChatPage() {
  const currentChatId = useAgentChatStore((s) => s.currentChatId);

  return (
    <div className="flex gap-8 w-full h-full p-8">

      <AgentChatList />

      <Card className="flex-1 min-w-[320px]">

        <CardHeader>
          <CardTitle>
            {currentChatId ? `Chat #${currentChatId}` : "No Chat Selected"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <AgentChatMessages chatId={currentChatId} />
          <AgentChatInput />
        </CardContent>
      </Card>
    </div>
  );
}
