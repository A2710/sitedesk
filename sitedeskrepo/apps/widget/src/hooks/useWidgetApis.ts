import apiClient from "@/api/apiClient";
import { useWidgetStore } from "./useWidgetStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type {
  // WidgetCustomer,
  // WidgetCategory,
  WidgetLoginResponse,
  WidgetStartChatResponse,
  WidgetChat,
  WidgetMessage,
  WidgetEndChatResponse,
  SubmitFeedbackInput,
  WidgetFeedbackResponse,
} from "@repo/common/types";

// Set JWT for all apiClient requests
function setAuthToken(token: string | null) {
  if (token) apiClient.defaults.headers.Authorization = `Bearer ${token}`;
  else delete apiClient.defaults.headers.Authorization;
}

export function useWidgetApi() {
  const token = useWidgetStore((s) => s.token);
  const setCustomer = useWidgetStore((s) => s.setCustomer);
  const queryClient = useQueryClient();

  // Always keep apiClient JWT header up to date
  setAuthToken(token);

  // --- LOGIN ---
  const loginMutation = useMutation<WidgetLoginResponse, any, { name: string; email: string }>({
    mutationFn: (data) =>
      apiClient.post("/customer/login", data).then(r => r.data),
    onSuccess: (data) => {
      setCustomer(data.customer, data.token);
      setAuthToken(data.token);
    },
  });

  // --- CATEGORIES ---
  const useCategories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      const response =  await apiClient.post("/categories").then(r => r.data);
      return response || [];
    },
    enabled: !!token, // Only runs when token exists
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // --- START CHAT ---
  const startChatMutation = useMutation<WidgetStartChatResponse, any, number>({
    mutationFn: async (categoryId: number) =>
      await apiClient.post("/chat/start", { categoryId }).then(r => r.data as WidgetStartChatResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  // --- GET CHATS (for history) ---
  const useChats = (): UseQueryResult<WidgetChat[]> =>
    useQuery({
      queryKey: ["chats"],
      queryFn: () => apiClient.get("/chat").then(r => r.data as WidgetChat[]),
      enabled: !!token,
      refetchOnWindowFocus: false,
    });

  // --- GET MESSAGES FOR CHAT ---
  const useMessages = (chatId?: string): UseQueryResult<WidgetMessage[]> =>
    useQuery({
      queryKey: ["messages", chatId],
      queryFn: () =>
        chatId
          ? apiClient.get(`/chat/${chatId}/messages`).then(r => r.data as WidgetMessage[])
          : [],
      enabled: !!token && !!chatId,
      refetchOnWindowFocus: true,
    });


  // --- SUBMIT FEEDBACK ---

  const submitFeedbackMutation = useMutation<WidgetFeedbackResponse, Error, SubmitFeedbackInput>({
    mutationFn: async (data: SubmitFeedbackInput) =>
      await apiClient.post("/chat/feedback", data).then(r => r.data as WidgetFeedbackResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  // --- END CHAT ---
  const endChatMutation = useMutation<WidgetEndChatResponse, any, string>({
    mutationFn: async (chatId: string) =>
      apiClient.post(`/chat/${chatId}/cancel`).then(r => r.data as WidgetEndChatResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  return {
    useCategories,
    useChats,
    useMessages,
    loginMutation,
    startChatMutation,
    endChatMutation,
    submitFeedbackMutation
  };
}
