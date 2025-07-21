import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCategories, useAddCategory, useEditCategory, useDeleteCategory } from "@/hooks/category.js";
import { categorySchema, CategoryInput, editCategoryInput } from "@repo/common/types";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import { FormError } from "@/components/FormError.js";
import { getFriendlyMessage } from "@/lib/error-messages.js";

export default function CategoriesPage() {
    const {data: categories, isLoading} = useCategories();
    const addCategory = useAddCategory();
    const editCategory = useEditCategory();
    const deleteCategory = useDeleteCategory();

    const [editRow, setEditRow] = useState<editCategoryInput | undefined>(undefined);

    //form for adding new category
    const addForm = useForm<CategoryInput>({
        resolver: zodResolver(categorySchema),
        defaultValues: {name: ""}
    });

    //form for editing new category
    const editForm = useForm<CategoryInput>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: ""}
    });

    const handleAddSubmit: SubmitHandler<CategoryInput> = data => {
        addCategory.mutate(data, {
            onSuccess: () => {
                addForm.reset();
            },
        });
    };

    const startEdit = (catId: number, catName: string) => {
        setEditRow({id: catId, name: catName});
        editForm.reset({name: catName});
    }

    const handleEditSubmit: SubmitHandler<CategoryInput> = data => {
      console.log(editRow);
        if(!editRow) return;
        editCategory.mutate(
        {
            id: editRow.id, 
            name: data.name
        }, 
        {
            onSuccess: () => {
                setEditRow(undefined)
            }
        });
    }

    const cancelEdit = () => setEditRow(undefined);

    const handleDelete = (id: number) => {
        if(window.confirm("Delete this category?")){
            deleteCategory.mutate({id});
        }
    };

    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Categories</h1>
        <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="flex gap-2 mb-6">
          <Input 
            {...addForm.register("name")}
            placeholder="Add New Category"
            disabled = {addCategory.isPending}
          >
          </Input>
          <Button
            type="submit"
            className="bg-green-600 text-white px-4 rounded"
            disabled={addCategory.isPending}
          >
            Add
          </Button>
        </form>
        {addForm.formState.errors.name && (
          <div className="text-red-600 mb-4">{addForm.formState.errors.name.message}</div>
        )}
        <FormError error={addCategory.isError ? getFriendlyMessage(addCategory.error) : undefined} />

        {isLoading ? (
          <div>Loading...</div>
          ) : (
            <ul className="divide-y">
              {categories?.map(cat => 
                editRow && editRow.id === cat.id ? (
                  //For edit mode
                  <li key={cat.id} className="py-2 flex items-center gap-2">
                    <form
                      onSubmit={editForm.handleSubmit(handleEditSubmit)}
                      className="flex flex-1 items-center gap-2"
                    >
                      <Input
                        {...editForm.register("name")}
                        className="flex-1 border rounded p-2"
                        disabled={editCategory.isPending}
                      />
                      <Button
                        type="submit"
                        className="bg-blue-600 text-white px-4 rounded"
                        disabled={editCategory.isPending}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        className="bg-gray-400 text-white px-4 rounded"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    </form>
                    {editForm.formState.errors.name && (
                      <div className="text-red-600">{editForm.formState.errors.name.message}</div>
                    )}
                    <FormError error={editCategory.isError ? getFriendlyMessage(editCategory.error) : undefined} />
                  </li>

                ):
                (
                  <li key={cat.id} className="py-2 flex items-center justify-between">
                    <span>{cat.name}</span>
                    <span className="flex gap-2">
                      <Button
                        className="text-blue-600 hover:underline"
                        onClick={() => startEdit(cat.id, cat.name)}
                        disabled={addCategory.isPending || editCategory.isPending}
                      >
                        Edit
                      </Button>
                      <Button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(cat.id)}
                        disabled={deleteCategory.isPending}
                      >
                        Delete
                      </Button>
                    </span>
                  </li>
                )
              )}
            </ul>
          )}

      </div>
    );
}
