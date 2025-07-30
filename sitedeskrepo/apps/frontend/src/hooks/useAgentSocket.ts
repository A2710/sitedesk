import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAgentChatStore } from "../stores/agentChatStore.js";
import type { Chat, Message } from "@repo/common/types";

let socket: Socket | null = null;

export function useAgentSocket() {
  const addChat = useAgentChatStore((s) => s.addChat);
  const addMessage = useAgentChatStore((s) => s.addMessage);
  const agentJWT = localStorage.getItem("agentJWT");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!agentJWT) return;

    // Prevent duplicate sockets
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    socketRef.current = io("http://localhost:5001", {
      auth: { token: agentJWT }
    });
    socket = socketRef.current;

    const interval = setInterval(() => {
      if (agentJWT && socketRef.current?.connected) {
        socketRef.current.emit("heartbeat");
      }
    }, 20000);

    socketRef.current.on("chat_assigned", ({ chat }: { chat: Chat }) => {
      addChat(chat);
      socketRef.current?.emit("join_chat", { chatId: chat.id });
    });

    socketRef.current.on("receive_message", (msg: Message) => {
      addMessage(msg.chatId, msg);
    });

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      socketRef.current?.disconnect();
      socketRef.current = null;
      socket = null;
    };
  }, [agentJWT, addChat, addMessage]);
}

export { socket };
