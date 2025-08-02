import { useState, useEffect, useRef } from "react";
import { socket } from "@/hooks/useAgentSocket";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AgentChatInput({
  chatId,
  senderType = "AGENT",
  onSend
}: {
  chatId: string;
  senderType: "AGENT" | "CUSTOMER";
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitTyping = () => {
    if (!socket) return;
    socket.emit("typing",  { chatId, senderType });
    console.log("hello the agent is typing");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      socket?.emit("stop_typing", { chatId, senderType });
    }, 800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    emitTyping();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket) return;
    socket.emit("stop_typing", { chatId, senderType });
    onSend(text);
    setText("");
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      socket?.emit("stop_typing", { chatId, senderType });
    };
  }, [chatId, senderType]);

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 mt-2">
      <Textarea
        value={text}
        onChange={handleChange}
        rows={1}
        placeholder="Type your reply…"
        className="flex-1"
      />
      <Button type="submit" disabled={!text.trim()}>
        Send
      </Button>
    </form>
  );
}
