import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient.js";
import type { CreateTeamInput, ListTeamsOutput, TeamCreateOutput } from "@repo/common/types";

// List teams
export function useTeams() {
  return useQuery<ListTeamsOutput[]>({
    queryKey: ["teams"],
    queryFn: async () => (await apiClient.get("/teams")).data,
  });
}
// Get one team
export function useTeam(id: number | string) {
  return useQuery<ListTeamsOutput>({
    queryKey: ["team", id],
    queryFn: async () => (await apiClient.get(`/teams/${id}`)).data,
    enabled: !!id,
  });
}
// Add
export function useAddTeam() {
  const qc = useQueryClient();
  return useMutation<TeamCreateOutput, Error, CreateTeamInput>({
    mutationFn: data => apiClient.post<TeamCreateOutput>("/teams", data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}
// Edit
export function useEditTeam() {
  const qc = useQueryClient();
  return useMutation<TeamCreateOutput, Error, { id: number; name: string }>({
    mutationFn: ({ id, name }) => apiClient.put<TeamCreateOutput>(`/teams/${id}`, { name }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}
// Delete
export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number }>({
    mutationFn: ({ id }) => apiClient.delete(`/teams/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}
// Assign categories
export function useAssignCategoriesToTeam() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number; categoryIds: number[] }>({
    mutationFn: ({ id, categoryIds }) => apiClient.post(`/teams/${id}/categories`, { categoryIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}
// Assign agents
export function useAssignAgentsToTeam() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number; userIds: number[] }>({
    mutationFn: ({ id, userIds }) => apiClient.post(`/teams/${id}/agents`, { userIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}
