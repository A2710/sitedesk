import { create } from "zustand";
import type { Chat, Message } from "@repo/common/types";

interface AgentChatStore {
  chatList: Chat[];
  currentChatId: number | null;
  messagesByChatId: Record<number, Message[]>;

  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  setCurrentChat: (chatId: number) => void;
  addMessage: (chatId: number, msg: Message) => void;
  clearMessages: (chatId: number) => void;
}

export const useAgentChatStore = create<AgentChatStore>((set) => ({
  chatList: [],
  currentChatId: null,
  messagesByChatId: {},

  setChats: (chats) => set({ chatList: chats }),
  addChat: (chat) =>
    set((state) => ({ chatList: [...state.chatList, chat] })),
  setCurrentChat: (chatId) => set({ currentChatId: chatId }),
  addMessage: (chatId, msg) =>
    set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: [...(state.messagesByChatId[chatId] || []), msg],
      },
    })),
  clearMessages: (chatId) =>
    set((state) => ({
      messagesByChatId: { ...state.messagesByChatId, [chatId]: [] },
    })),
}));
