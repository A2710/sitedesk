import { useEffect, useRef } from "react";
import { useWidgetStore } from "@/hooks/useWidgetStore";
import { useWidgetApi } from "@/hooks/useWidgetApis";
import { socket, useWidgetSocket } from "@/hooks/useWidgetSocket";
import { WidgetMessageInput } from "./WidgetMessageInput";
import { WidgetEndChatButton } from "./WidgetEndChatButton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator.js";

export function WidgetChatWindow() {
  const currentChat = useWidgetStore((s) => s.currentChat);
  const { chatMessages, setMessages } = useWidgetStore();
  const { useMessages } = useWidgetApi();

  const DEFAULT_TYPING = { AGENT: false, CUSTOMER: false };
  const typing = useWidgetStore(s => {
    if (!currentChat) return DEFAULT_TYPING;
    return currentChat ? s.typingByChatId[currentChat.id] || DEFAULT_TYPING : DEFAULT_TYPING
  });

  useWidgetSocket();

  // Fetch messages from REST when chatId changes (or on mount) 
  const { data: messages = [] } = useMessages(currentChat ? currentChat.id : undefined);

  // When REST query gets new data (history or on refresh), update Zustand
  useEffect(() => {
    if (messages && messages.length > 0) {
      setMessages(messages);
    }
  }, [messages, setMessages]);

  // smooth scroll when chatMessage array changes
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, typing]);

  if (!currentChat)
    return (
      <Card>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No active chat.
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card className="flex flex-col h-[400px]">
      <CardContent className="flex flex-col h-full px-2 py-3">
        <div className="flex-1 overflow-y-auto bg-background rounded p-2 border mb-2">
          {chatMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No messages yet.</div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div key={msg.id || idx} className="mb-2 flex items-start">
                <div
                  className={`rounded-lg px-3 py-2 shadow-sm text-sm ${
                    msg.senderType === "CUSTOMER"
                      ? "bg-blue-50 text-blue-900 ml-auto"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  style={{ maxWidth: "80%" }}
                >
                  <span className="font-semibold block mb-1 text-xs">
                    {msg.senderType === "CUSTOMER" ? "You" : "Agent"}
                  </span>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div>
          {typing.AGENT && (
              <div className="px-3 py-1 text-gray-500 text-sm">
                Agent is typing…
              </div>
            )}
          </div>
          <div ref={bottomRef} />
        </div>
        <Separator className="my-1" />

        <WidgetMessageInput chatId={currentChat.id} senderType="CUSTOMER" onSend={(text) => {socket?.emit("send_message", {chatId: currentChat.id, text})}}/>
        <WidgetEndChatButton chatId={currentChat.id} />
      </CardContent>
    </Card>
  );
}
