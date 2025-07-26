import { useUsers, useDeleteUser } from "@/hooks/users.js";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog.js";
import { Button } from "@/components/ui/button.js";
import { DataTable } from "@/components/ui/data-table.js";
import { columns } from "@/components/user/columns.js";
import { UserForm } from "@/components/user/UserForm.js";
import { useState } from "react";
import { GetMeResponse, AdminUserCreateInput } from "@repo/common/types";
import { useCurrentUser } from "@/hooks/auth.js";
import { WhiteBlackButton } from "@/components/utils/WhiteBlackButton.js";

export default function UserListPage() {
  const { data: users = [], isLoading } = useUsers();
  const { data: currentUser, isLoading: isLoadingUSER } = useCurrentUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<GetMeResponse | null>(null);
  const deleteMutation = useDeleteUser();

  const filteredUsers = users.filter(user => user.id !== currentUser?.id);

  if(isLoadingUSER) return <div>Loading...</div>

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">User Management</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <WhiteBlackButton content={"Add User"}></WhiteBlackButton>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <UserForm
              onSuccess={() => setIsCreateOpen(false)}
              defaultValues={{
                name: "",
                email: "",
                password: "",
                role: "AGENT",
                teamId: undefined,
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          columns={columns({
            onEdit: (user: GetMeResponse) => setSelectedUser(user),
            onDelete: (id: number) => deleteMutation.mutate({ id }),
          })}
          data={filteredUsers}
        />
      )}

      {selectedUser && (
        <Dialog open onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="bg-white">
            <UserForm
              id={selectedUser.id}
              defaultValues={{
                name: selectedUser.name,
                email: selectedUser.email,
                role: selectedUser.role,
                teamId: selectedUser.teamsDataArray[0]?.id,
              }}
              onSuccess={() => setSelectedUser(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
