import { useState } from "react";
import { useTeams, useAddTeam, useEditTeam, useDeleteTeam } from "@/hooks/team.js";
import { DataTable } from "@/components/ui/data-table.js";
import { columns } from "@/components/teams/columns.js";
import { TeamForm } from "@/components/teams/TeamForm.js";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog.js";
import { CategoryAssignField } from "@/components/teams/CategoryAssignField.js";
import { WhiteBlackButton } from "@/components/utils/WhiteBlackButton.js";

export default function TeamsPage() {
  const { data: teams = [], isLoading } = useTeams();
  const addTeam = useAddTeam();
  const editTeam = useEditTeam();
  const deleteTeam = useDeleteTeam();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);

  const [assignTeam, setAssignTeam] = useState<any | null>(null); // Assign category dialog

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Teams</h1>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <WhiteBlackButton content="Add Team"/>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <TeamForm
              defaultValues={{ name: selectedTeam?.name ?? "" }}
              onSubmit={(values) => {
                if (selectedTeam) {
                  editTeam.mutate(
                    { id: selectedTeam.id, name: values.name },
                    { onSuccess: () => setIsFormOpen(false) }
                  );
                } else {
                  addTeam.mutate(values, { onSuccess: () => setIsFormOpen(false) });
                }
              }}
              onCancel={() => {setIsFormOpen(false)}}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Table */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          columns={columns({
            onEdit: (team) => {
              setSelectedTeam(team);
              setIsFormOpen(true);
            },
            onDelete: (id) => deleteTeam.mutate({ id }),
            onAssignCategories: (id) => {
              const team = teams.find((t) => t.id === id);
              setAssignTeam(team);
            },
          })}
          data={teams}
        />
      )}

      {/* Assign Categories Dialog */}
      {assignTeam && (
        <Dialog open={!!assignTeam} onOpenChange={() => setAssignTeam(null)}>
          <DialogContent className="max-w-lg bg-white">
            <h2 className="text-lg font-semibold mb-2">
              Assign Categories to {assignTeam.name}
            </h2>
            <div className="p-4 flex-1 overflow-auto">
            <CategoryAssignField
              teamId={assignTeam.id}
              initialCategories={assignTeam.categories}
              onClose={() => setAssignTeam(null)}
            />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
