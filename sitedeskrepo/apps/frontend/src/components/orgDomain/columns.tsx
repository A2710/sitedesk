import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.js";
import { ConfirmDialog } from "@/components/utils/confirmDialog.js";

type ActionHandlers = {
  onEdit: (domain: any) => void;
  onDelete: (id: number) => void;
};

export const columns = ({ onEdit, onDelete }: ActionHandlers): ColumnDef<any>[] => [
  {
    header: "Domain",
    accessorKey: "domain",
  },
  {
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          className="bg-blue-100 text-blue-700 hover:bg-blue-700 hover:text-blue-100"
          variant="outline"
          onClick={() => onEdit(row.original)}
        >
          Edit
        </Button>
        <ConfirmDialog
          message={`Delete domain ${row.original.domain}?`}
          onConfirm={() => onDelete(row.original.id)}
          trigger={
            <Button
              className="bg-red-100 text-red-700 hover:bg-red-700 hover:text-red-100"
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
