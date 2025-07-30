import { useState } from "react";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import { useAgentChatStore } from "@/stores/agentChatStore.js";
import { socket } from "@/hooks/useAgentSocket.js";

export function AgentChatInput() {
  const currentChatId = useAgentChatStore((s) => s.currentChatId);
  const [text, setText] = useState("");

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !currentChatId || !socket) return;
    socket.emit("send_message", { chatId: currentChatId, text });
    setText("");
  }

  return (
    <form onSubmit={handleSend} className="flex gap-2 mt-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
        disabled={!currentChatId}
        className="flex-1"
      />
      <Button type="submit" disabled={!currentChatId || !text.trim()}>
        Send
      </Button>
    </form>
  );
}
