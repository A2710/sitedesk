import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.js";
import type { GetMeResponse } from "@repo/common/types";
import { ConfirmDialog } from "../utils/confirmDialog.js";

type ActionHandlers = {
  onEdit: (user: GetMeResponse) => void;
  onDelete: (id: number) => void;
};

export const columns = ({ onEdit, onDelete }: ActionHandlers): ColumnDef<GetMeResponse>[] => [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Role",
    accessorKey: "role",
  },
  {
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button 
          className = "hover:bg-blue-700 hover:text-blue-100 text-blue-700 bg-blue-100" 
          variant="outline" 
          onClick={() => onEdit(row.original)}
        >
          Edit
        </Button>
        
        <ConfirmDialog
          message={`Are you sure you want to delete ${row.original.name}?`}
          onConfirm={() => onDelete(row.original.id)}
          trigger={
            <Button
              className="hover:bg-red-700 hover:text-red-100 text-red-700 bg-red-100"
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
