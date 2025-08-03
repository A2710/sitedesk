import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useWidgetStore } from "./useWidgetStore";
import type { WidgetMessage } from "@repo/common/types";

let socket: Socket | null = null;

export function useWidgetSocket() {
  const token = useWidgetStore((s) => s.token);
  const addMessage = useWidgetStore((s) => s.addMessage);
  const currentChat = useWidgetStore((s) => s.currentChat);
  const setStatus = useWidgetStore((s) => s.setStatus);

  useEffect(() => {
    if (!token || !currentChat) return;
    if (socket) socket.disconnect();

    socket = io("http://localhost:5001", { auth: { token } });

    socket.on("connect", () => {
      console.log("Socket connected!", socket?.id);
    })

    socket.emit("join_chat", { chatId: currentChat.id });

    socket.on("receive_message", (msg: WidgetMessage) => {
      // console.log("message received: ", msg);
      addMessage(msg);
    });

    socket.on("chat_completed", () => {
      // console.log("The chat is completed: ", chatId);
      setStatus("EXIT");
    });

    socket.on("typing", ({ chatId, senderType }) => {
      useWidgetStore.getState().setTyping(chatId, senderType, true);
    });
    socket.on("stop_typing", ({ chatId, senderType }) => {
      useWidgetStore.getState().setTyping(chatId, senderType, false);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected!");
    });

    return () => {
      if (currentChat) socket?.emit("leave_chat", { chatId: currentChat.id });
      socket?.disconnect();
      socket = null;
    };
  }, [token, currentChat]);
}

export { socket };
