import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import type { Status, Chat, Message } from "@repo/common/types";

export function useMyChats(status?: Status) {
  return useQuery<Chat[], Error>({
    queryKey: ["my-chats", status ?? "ALL"],
    queryFn: async () => {
      let url = "/users/chats/my";
      if (status) {
        url += `?status=${encodeURIComponent(status)}`;
      }
      const { data } = await apiClient.get<Chat[]>(url);
      return data;
    },
    staleTime: 30_000,
  });
}


// Fetch all messages for a specific chat
export function useChatMessages(chatId: string | null) {
  return useQuery<Message[]>({
    queryKey: ["chat-messages", chatId],
    queryFn: async () => {
      if (!chatId) return [];
      const { data } = await apiClient.get(`/users/chats/${chatId}/messages`);
      return data;
    },
    enabled: !!chatId,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}

// Assign next chat (mutation)
export function useAssignNextChat() {
  const qc = useQueryClient();
  return useMutation<Chat, Error, void>({
    mutationFn: async () => {
      // force axios to give us the raw status so we can handle 204
      const resp = await apiClient.get<{ chat?: Chat }>(
        "/users/chats/next-chat",
        { validateStatus: () => true }
      );
      if (resp.status === 204 || !resp.data.chat) {
        throw new Error("No chats available right now.");
      }
      return resp.data.chat!;
    },
    onSuccess: () => {
      // refresh your “my-chats” cache
      qc.invalidateQueries({ queryKey: ["my-chats"] });
    },
  });
}

export async function fetchMessagesForChat(chatId: string): Promise<Message[]> {
  const { data } = await apiClient.get(`/users/chats/${chatId}/messages`);
  return data;
}