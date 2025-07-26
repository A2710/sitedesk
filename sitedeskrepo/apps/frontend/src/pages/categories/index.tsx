import { useState } from "react";
import { useCategories, useDeleteCategory } from "@/hooks/category.js";
import { DataTable } from "@/components/ui/data-table.js";
import { columns } from "@/components/category/columns.js";
import { CategoryForm } from "@/components/category/CategoryForm.js";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog.js";
import { Button } from "@/components/ui/button.js";
import { ConfirmDialog } from "@/components/utils/confirmDialog.js";
import { CategoryInput, categoriesOutput } from "@repo/common/types";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<categoriesOutput | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Category Management</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant={"outline"} className="hover:bg-zinc-900 hover:text-white">
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <CategoryForm
              onSuccess={() => setIsCreateOpen(false)}
              defaultValues={{ name: "" }}
              onClose={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          columns={columns({
            onEdit: (category: categoriesOutput) => setSelectedCategory(category),
            onDelete: (id: number) => deleteCategory.mutate({id}),
          })}
          data={categories}
        />
      )}

      {/* Edit Modal */}
      {selectedCategory && (
        <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
          <DialogContent className="bg-white">
            <CategoryForm
              id={selectedCategory.id}
              defaultValues={{ name: selectedCategory.name }}
              onSuccess={() => setSelectedCategory(null)}
              onClose={() => {setSelectedCategory(null)}}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
