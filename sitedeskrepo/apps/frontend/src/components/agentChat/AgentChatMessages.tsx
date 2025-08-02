import { ScrollArea } from "@/components/ui/scroll-area.js";
import { useCurrentUser } from "@/hooks/auth";
import { useChatMessages } from "@/hooks/useAgentChat";
import { useAgentChatStore } from "@/stores/agentChatStore.js";
import type { Message } from "@repo/common/types";
import { useEffect, useRef, useState } from "react";

interface Props { chatId: string; }

export function AgentChatMessages({ chatId }: Props) {
  
  const DEFAULT_TYPING = { AGENT: false, CUSTOMER: false };
  const typing = useAgentChatStore(s => {
    if (!chatId) return DEFAULT_TYPING;
    return s.typingByChatId[chatId] ?? DEFAULT_TYPING;
  });


  // 1️⃣ fetch initial history from your backend
  const { data: history = [], isSuccess, isPending } = useChatMessages(chatId);

  // 2️⃣ push that into your store when it arrives
  const setMessages = useAgentChatStore(s => s.setMessages);
  useEffect(() => {
    if (isSuccess) {
      setMessages(chatId, history);
    }
  }, [isSuccess, chatId, history, setMessages]);

  // 3️⃣ local state to hold *just* this chat’s array
  const messagesByChatId = useAgentChatStore((s) => (s.messagesByChatId));
  const [messages, setLocalMessages] = useState<Message[]>([]);

  // 4️⃣ subscribe to only this key in your zustand store
  useEffect(() => {
    // initialize
    setLocalMessages(
      useAgentChatStore.getState().messagesByChatId[chatId] || []
    );
    // now subscribe
    const unsubscribe = useAgentChatStore.subscribe(
      state => state.messagesByChatId[chatId] || []
    );
    return unsubscribe;
  }, [chatId, messagesByChatId]);

  // 5️⃣ scroll‐to‐bottom on every new message
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatId, typing]);

  const { data: user, isPending: userPending } = useCurrentUser();

  if (!chatId) {
    return (
      <ScrollArea className="h-80 border rounded-md p-2 w-full">
        <div className="text-gray-600">Select a chat to start messaging.</div>
      </ScrollArea>
    );
  }

  if (isPending || userPending || !user) {
    return (
      <ScrollArea className="h-80 border rounded-md p-2 w-full">
        <div className="text-gray-600">Loading messages…</div>
      </ScrollArea>
    );
  }

  return (
    <div>
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No messages yet.</div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="mb-2 flex items-start">
            <div
              className={`rounded-lg px-3 py-2 shadow-sm text-sm ${
                msg.senderType !== "CUSTOMER"
                  ? "bg-blue-50 text-blue-900 ml-auto"
                  : "bg-gray-100 text-gray-800"
              }`}
              style={{ maxWidth: "80%" }}
            >
              <span className="font-semibold block mb-1 text-xs">
                {msg.senderType !== "CUSTOMER" ? "You" : "Customer"}
              </span>
              {msg.content}
            </div>
          </div>
        ))
      )}
      <div>
        {chatId && typing.CUSTOMER && (
          <div className="px-3 py-1 text-gray-500 text-sm">
            Customer is typing…
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
