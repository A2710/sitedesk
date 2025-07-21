import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient.js"; // .js extension
import { categoriesOutput, CategoryInput, editCategoryInput, deleteCategoryInput } from "@repo/common/types";

async function addCategory(data: CategoryInput): Promise<categoriesOutput> {
    return apiClient
        .post<categoriesOutput>('/category', data)
        .then(res => res.data);
}

async function editCategory(data: editCategoryInput): Promise<categoriesOutput> {
    return apiClient
        .put<categoriesOutput>(`/category/${data.id}`, {name: data.name})
        .then(res => res.data);
}

async function deleteCategory({id}: deleteCategoryInput): Promise<string> {
    return apiClient
        .delete<string>(`/category/${id}`)
        .then(res => res.data);
}

// List all categories
export function useCategories() {
  return useQuery<categoriesOutput[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get("/category");
      return res.data;
    },
  });
}

// Add category
export function useAddCategory() {
  const queryClient = useQueryClient();
  return useMutation<categoriesOutput, Error, CategoryInput>({
    mutationFn: (data: CategoryInput) => addCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["categories"]});
    },
  });
}

// Edit category

export function useEditCategory() {
  const queryClient = useQueryClient();
  return useMutation<categoriesOutput, Error, editCategoryInput>({
    mutationFn: (data: editCategoryInput) => editCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["categories"]});
    },
  });
}

// Delete category
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation<string, Error, deleteCategoryInput>({
    mutationFn: (data: deleteCategoryInput) => deleteCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["categories"]});
    },
  });
}
