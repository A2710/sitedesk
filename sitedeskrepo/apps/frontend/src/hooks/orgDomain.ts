import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient.js";
import type { OrgDomainInput } from "@repo/common/types";

// List all domains
export function useOrgDomains() {
  return useQuery({
    queryKey: ["orgDomains"],
    queryFn: async () => (await apiClient.get("/orgDomain")).data,
  });
}

// Add domain
export function useAddDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OrgDomainInput) =>
      apiClient.post("/orgDomain", data).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orgDomains"] }),
  });
}

// Edit domain
export function useEditDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrgDomainInput }) =>
      apiClient.put(`/orgDomain/${id}`, data).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orgDomains"] }),
  });
}

// Delete domain
export function useDeleteDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/orgDomain/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orgDomains"] }),
  });
}
