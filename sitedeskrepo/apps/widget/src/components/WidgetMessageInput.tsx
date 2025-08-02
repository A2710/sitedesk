import { useEffect, useRef, useState } from "react";
import { useWidgetStore } from "@/hooks/useWidgetStore";
import { socket } from "@/hooks/useWidgetSocket";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";

export function WidgetMessageInput({
  chatId,
  senderType = "CUSTOMER",
  onSend
}: {
  chatId: string;
  senderType: "AGENT" | "CUSTOMER";
  onSend: (text: string) => void;
}) {
  const currentChat = useWidgetStore((s) => s.currentChat);
  // const addMessage = useWidgetStore((s) => s.addMessage);
  const [text, setText] = useState("");
  if (!currentChat) return null;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitTyping = () => {
    if (!socket) return;
    socket.emit("typing",  { chatId, senderType });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      socket?.emit("stop_typing", { chatId, senderType });
    }, 800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    emitTyping();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      socket?.emit("stop_typing", { chatId, senderType });
    };
  }, [chatId, senderType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChat?.id && !text.trim() && !socket) return;
    socket?.emit("stop_typing", { chatId, senderType });
    onSend(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <Textarea
        className="flex-1"
        placeholder="Type a message..."
        value={text}
        onChange={handleChange}
        autoFocus
        autoComplete="off"
      />
      <Button type="submit" size="sm" className="shrink-0">
        Send
      </Button>
    </form>
  );
}
