import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.js";
import { ConfirmDialog } from "@/components/utils/confirmDialog.js";

type ActionHandlers = {
  onEdit: (team: any) => void;
  onDelete: (id: number) => void;
  onAssignCategories: (id: number) => void;
};

export const columns = ({
  onEdit,
  onDelete,
  onAssignCategories,
}: ActionHandlers): ColumnDef<any>[] => [
  {
    header: "Team Name",
    accessorKey: "name",
  },
  {
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          className="bg-blue-100 text-blue-700 hover:bg-blue-700 hover:text-white"
          variant="outline"
          onClick={() => onEdit(row.original)}
        >
          Edit
        </Button>

        <ConfirmDialog
          message={`Delete team ${row.original.name}?`}
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

        <Button
          className="bg-yellow-500 text-white"
          onClick={() => onAssignCategories(row.original.id)}
        >
          Assign Categories
        </Button>
      </div>
    ),
  },
];
