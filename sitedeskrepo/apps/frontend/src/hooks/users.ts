import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient.js";
import type { GetMeResponse, AdminUserCreateInput, AdminUserUpdateInput, AdminUserCreateOutput } from "@repo/common/types";

// List all users
export function useUsers() {
  return useQuery<GetMeResponse[]>({
    queryKey: ["users"],
    queryFn: async () => (await apiClient.get("/users")).data,
  });
}

// Get one user
export function useUser(id: number) {
  return useQuery<GetMeResponse>({
    queryKey: ["user", id],
    queryFn: async () => (await apiClient.get(`/users/${id}`)).data,
    enabled: !!id,
  });
}

// Create user
export function useAddUser() {
  const qc = useQueryClient();
  return useMutation<GetMeResponse, Error, AdminUserCreateInput>({
    mutationFn: data => apiClient.post("/users", data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

// Update user
export function useEditUser() {
  const qc = useQueryClient();
  return useMutation<AdminUserCreateOutput, Error, { id: number; data: AdminUserUpdateInput }>({
    mutationFn: ({ id, data }) => apiClient.put(`/users/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

// Delete user
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number }>({
    mutationFn: ({ id }) => apiClient.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
