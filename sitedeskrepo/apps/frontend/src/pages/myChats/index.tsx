// apps/frontend/src/pages/ChatHistoryPage.tsx

import { useState } from "react";
import { useMyChats, useChatMessages } from "@/hooks/useAgentChat";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Chat, Message } from "@repo/common/types";

export function ChatHistoryPage() {
  const { data: chats = [], isLoading: chatsLoading, error: chatsError } = useMyChats("CLOSED");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const {data: messages = [],isLoading: msgsLoading,error: msgsError,} = useChatMessages(selectedChatId);

  return (
    <div className="flex h-full p-8 gap-6">
      
      {/* ── Left: Chat List ──────────────────────────── */}
      <Card className="w-1/3 h-dvh flex flex-col p-0 gap-0">
        <CardHeader className="bg-gray-400 rounded-xl p-4 items-center justify-center mb-0">
          <CardTitle className="text-lg font-bold">Your Closed Chats</CardTitle>
        </CardHeader>
        {/* <Separator /> */}
        <CardContent className="flex-1 flex flex-col overflow-auto border-0 p-0">
          {chatsLoading ? (
            <div className="p-4 text-center">Loading chats…</div>
          ) : chatsError ? (
            <div className="p-4 text-center text-red-500">
              Error loading chats
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              No closed chats found.
            </div>
          ) : (
            <div className="overflow-y-auto">
            {/* <ScrollArea className="h-full rounded-md p-2 w-full"> */}
              <ul>
                {chats.map((chat: Chat) => (
                  <li key={chat.id}>
                    <Button
                      variant={chat.id === selectedChatId ? "secondary" : "ghost"}
                      className={`w-full justify-start py-2 px-4 ${chat.id === selectedChatId ? "bg-gray-300" : ""}`}
                      onClick={() => setSelectedChatId(chat.id)}
                    >
                      {`#${chat.id}`}
                    </Button>
                    <hr className="border-gray-500"/>
                  </li>
                ))}
              </ul>
            {/* </ScrollArea> */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Right: Message View ───────────────────────── */}
      <Card className="flex-1 h-dvh flex flex-col p-0 gap-0">
        <CardHeader className="bg-gray-400 rounded-xl p-4 items-center justify-center mb-0">
          <CardTitle className="text-lg font-bold">
            {selectedChatId ? `Chat #${selectedChatId}` : "Select a chat"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 border-0 overflow-auto">
          {selectedChatId ? (
            <>
              {msgsLoading ? (
                <div className="p-4 text-center">Loading messages…</div>
              ) : msgsError ? (
                <div className="p-4 text-center text-red-500">
                  Error loading messages
                </div>
              ) : messages.length === 0 ? (
                <div className="p-4 text-center text-gray-600">
                  No messages in this chat.
                </div>
              ) : (
                <div className="overflow-y-auto">
                {/* <ScrollArea className=" border rounded-md p-2 w-full flex-1"> */}
                  <ul className="space-y-3 p-4">
                    {messages.map((msg: Message) => (
                      <li key={msg.id} className="flex flex-col mb-5">
                        <div className={`rounded-xl ${
                              msg.senderType === "CUSTOMER"
                                ? "bg-gray-100 text-black ps-2 pe-4 self-start"
                                : "bg-blue-50 text-black pe-2 ps-4 self-end"
                            }`}>
                          <div className={`text-xs text-gray-600 font-bold ${
                              msg.senderType === "CUSTOMER"
                                ? "self-start"
                                : "self-end"
                            }`}>
                            {new Date(msg.createdAt).toLocaleString()} &mdash;{" "}
                            {msg.senderType === "CUSTOMER" ? "Customer" : "You"}
                          </div>
                          <div
                            className={`mt-1 text-md font-medium ${
                              msg.senderType === "CUSTOMER"
                                ? "self-start"
                                : "self-end"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                {/* </ScrollArea> */}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              Select a chat on the left to view its history.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
