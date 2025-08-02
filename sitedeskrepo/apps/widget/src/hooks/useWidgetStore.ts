import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WidgetCustomer, WidgetChat, WidgetMessage } from "@repo/common/types";

type SenderType = "CUSTOMER" | "AGENT"

interface TypingState {
  [chatId: string]: {
    AGENT: boolean;
    CUSTOMER: boolean;
  };
}

type WidgetState = {
  customer: WidgetCustomer | null;
  token: string | null;
  currentChat: WidgetChat | null;
  chatMessages: WidgetMessage[];
  status: "INIT" | "LOGGED_IN" | "IN_CHAT" | "ENDED";
  setCustomer: (c: WidgetCustomer, token: string) => void;
  setCurrentChat: (chat: WidgetChat) => void;
  setMessages: (messages: WidgetMessage[]) => void;
  addMessage: (msg: WidgetMessage) => void;
  setStatus: (s: WidgetState["status"]) => void;
  typingByChatId: TypingState;
  setTyping: (chatId: string, sender: SenderType, isTyping: boolean) => void;
  reset: () => void;
};

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      customer: null,
      token: null,
      currentChat: null,
      chatMessages: [],
      status: "INIT",
      setCustomer: (c, token) => set({ customer: c, token, status: "LOGGED_IN" }),
      setCurrentChat: (chat) => set({ currentChat: chat, status: "IN_CHAT" }),
      setMessages: (messages) => set({ chatMessages: messages }),
      addMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      setStatus: (s) => set({ status: s }),
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
      reset: () =>
        set({ customer: null, token: null, currentChat: null, chatMessages: [], status: "INIT" }),
    }),
    {
      name: "widget-storage", // name of item in localStorage
      partialize: (state) => ({
        // Only persist the critical state (avoid storing giant arrays if not needed)
        customer: state.customer,
        token: state.token,
        currentChat: state.currentChat,
        status: state.status,
        // Optionally: chatMessages, but be careful with large chats!
      }),
    }
  )
);
