import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAgentChatStore } from "@/stores/agentChatStore.js";
import type { Chat, Message } from "@repo/common/types";
import { useQueryClient } from "@tanstack/react-query";

let socket: Socket | null = null;

export function useAgentSocket() {
  const agentJWT = localStorage.getItem("agentJWT");
  const queryClient = useQueryClient();

  // Refs for store actions to always have the latest version
  const addChatRef = useRef(useAgentChatStore.getState().addChat);
  const addMessageRef = useRef(useAgentChatStore.getState().addMessage);
  const removeChatRef = useRef(useAgentChatStore.getState().removeChat);
  const clearCurrentChatRef = useRef(useAgentChatStore.getState().clearCurrentChat);
  const clearMessagesRef = useRef(useAgentChatStore.getState().clearMessages);

  // Keep refs up to date
  useEffect(() => {
    console.log("in the initial useEffect of the agent socket in the frontend");
    addChatRef.current = useAgentChatStore.getState().addChat;
    addMessageRef.current = useAgentChatStore.getState().addMessage;
    removeChatRef.current = useAgentChatStore.getState().removeChat;
    clearCurrentChatRef.current = useAgentChatStore.getState().clearCurrentChat;
    clearMessagesRef.current = useAgentChatStore.getState().clearMessages;
  }, []);

  useEffect(() => {
    if (!agentJWT) return;

    // Prevent duplicate sockets
    if (socket) {
      console.log("Disconnecting existing socket...");
      socket.disconnect();
      socket = null;
    }

    console.log("Connecting new socket with JWT...");
    socket = io("http://localhost:5001", {
      auth: { token: agentJWT },
      // transports: ["websocket"],
    });

    // Heartbeat (optional)
    const interval = setInterval(() => {
      if (agentJWT && socket?.connected) {
        socket.emit("heartbeat");
        console.log("heart beat for agent is on...")
      }
    }, 20000);

    socket.on("chat_assigned", ({ chat }: { chat: Chat }) => {
      console.log("Socket event: chat_assigned", chat);
      addChatRef.current(chat);
      socket?.emit("join_chat", { chatId: chat.id });
    });

    socket.on("receive_message", (msg: Message) => {
      console.log("Socket event: receive_message", msg);
      addMessageRef.current(msg.chatId, msg);
    });

    socket.on("chat_completed", ({ chatId }: { chatId: string }) => {
      console.log("Socket event: chat_completed", chatId);
      removeChatRef.current(chatId);
      clearCurrentChatRef.current();
      clearMessagesRef.current(chatId);
      queryClient.invalidateQueries({ queryKey: ["my-chats", "ACTIVE"] });
      socket?.emit("leave_chat", { chatId });
    });

    socket.on("typing", ({ chatId, senderType }) => {
      useAgentChatStore.getState().setTyping(chatId, senderType, true);
    });
    socket.on("stop_typing", ({ chatId, senderType }) => {
      useAgentChatStore.getState().setTyping(chatId, senderType, false);
    });

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket and interval");
      clearInterval(interval);
      socket?.disconnect();
      socket = null;
    };
    // eslint-disable-next-line
  }, [agentJWT]);
}

export { socket };
