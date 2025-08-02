import { AgentChatList } from "@/components/agentChat/AgentChatList";
import { AgentChatMessages } from "@/components/agentChat/AgentChatMessages";
import { AgentChatInput } from "@/components/agentChat/AgentChatInput";
import { CompleteChatButton } from "@/components/agentChat/AgentCompleteChat";
import { useAgentChatStore } from "@/stores/agentChatStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-select";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { socket } from "@/hooks/useAgentSocket";

export function AgentChatPage() {
  const currentChatId = useAgentChatStore(s => s.currentChatId);

  return (
    <div className="flex gap-8 w-full h-full p-8">
      <AgentChatList />
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex justify-between">
            {currentChatId ? `Chat #${currentChatId}` : "No Chat Selected"}
            {currentChatId && <CompleteChatButton />}
          </CardTitle>
          <Separator />
        </CardHeader>
        <CardContent className="flex flex-col">

          {currentChatId ? (
            <ScrollArea className="h-80 border rounded-md p-2 w-full overflow-auto">
    
             <AgentChatMessages chatId={currentChatId} />
          
            </ScrollArea>
          ) : (
            <ScrollArea className="h-80 border rounded p-4">
              <div className="text-gray-600">Select a chat to start</div>
            </ScrollArea>
          )}

          {currentChatId && (
            <AgentChatInput
              chatId={currentChatId}
              senderType="AGENT"
              onSend={(text) => {
                socket?.emit("send_message", { chatId: currentChatId, text });
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
