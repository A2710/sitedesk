import { create } from "zustand";
import type { Chat, Message } from "@repo/common/types";
import {persist} from "zustand/middleware";

type SenderType = "CUSTOMER" | "AGENT";

interface TypingState {
  [chatId: string]: {
    AGENT: boolean;
    CUSTOMER: boolean;
  };
}

interface AgentChatStore {
  chatList: Chat[];
  currentChatId: string | null;
  messagesByChatId: Record<string, Message[]>;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  removeChat: (chatId: string) => void;
  clearCurrentChat: () => void;
  setCurrentChat: (chatId: string | null) => void;
  addMessage: (chatId: string, msg: Message) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  clearMessages: (chatId: string) => void;
  typingByChatId: TypingState;
  setTyping: (chatId: string, sender: SenderType, isTyping: boolean) => void;
  reset: () => void;
}

export const useAgentChatStore = create<AgentChatStore>()(
  persist(
    (set, get) => ({
      chatList: [],
      currentChatId: null,
      messagesByChatId: {},
      setChats: (chats) => {
        set({ chatList: chats });
      },
      addChat: (chat) => {
        set((state) => ({
          chatList: state.chatList.some((c) => c.id === chat.id)
            ? state.chatList
            : [...state.chatList, chat],
        }));
      },
      removeChat: (chatId) => {
        set((state) => ({
          chatList: state.chatList.filter((chat) => chat.id !== chatId),
          currentChatId:
            state.currentChatId === chatId ? null : state.currentChatId,
        }));
      },
      setCurrentChat: (chatId) => {
        set({ currentChatId: chatId });
      },
      clearCurrentChat: () => {
        set({ currentChatId: null });
      },
      addMessage: (chatId, msg) => {
        set((state) => ({
          messagesByChatId: {
            ...state.messagesByChatId,
            [chatId]: [...(state.messagesByChatId[chatId] || []), msg],
          },
        }));
      },
      setMessages: (chatId, messages) => {
        set((state) => ({
          messagesByChatId: { ...state.messagesByChatId, [chatId]: messages },
        }));
      },
      clearMessages: (chatId) => {
        set((state) => ({
          messagesByChatId: { ...state.messagesByChatId, [chatId]: [] },
        }));
      },
      typingByChatId: {},
      setTyping: (chatId, sender, isTyping) => {
        set(state => {
          const chatTyping = state.typingByChatId[chatId] || {AGENT: false, CUSTOMER: false};
          return{
            typingByChatId: {
              ...state.typingByChatId,
              [chatId]: {...chatTyping, [sender]: isTyping}
            }
          }
        })
      },
      reset: () => {
        set({
          chatList: [],
          currentChatId: null,
          messagesByChatId: {},
        });
      },
    }),
    {
      name: "agent-chat-store", // unique name in storage
      partialize: (state) => ({
        chatList: state.chatList,
        currentChatId: state.currentChatId,
        messagesByChatId: state.messagesByChatId,
      }),
    }
  )
);
