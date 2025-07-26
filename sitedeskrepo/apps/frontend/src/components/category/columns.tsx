import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.js";
import { categoriesOutput } from "@repo/common/types";
import { ConfirmDialog } from "../utils/confirmDialog.js";

type ActionHandlers = {
  onEdit: (category: categoriesOutput) => void;
  onDelete: (id: number) => void;
};

export const columns = ({ onEdit, onDelete }: ActionHandlers): ColumnDef<categoriesOutput>[] => [
  {
    header: "Category",
    accessorKey: "name",
  },
  {
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          className="hover:bg-blue-700 hover:text-blue-100 text-blue-700 bg-blue-100"
          variant="outline"
          onClick={() => onEdit(row.original)}
        >
          Edit
        </Button>
        <ConfirmDialog
            message={`Delete category ${row.original.name}?`}
            onConfirm={() => onDelete(row.original.id)}
            trigger={
            <Button
                className="bg-red-100 text-red-700 hover:bg-red-700 hover:text-white"
                variant="outline"
            >
                Delete
            </Button>
            }
        />
      </div>
    ),
  },
];
