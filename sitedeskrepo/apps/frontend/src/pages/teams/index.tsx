import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTeams, useAddTeam, useEditTeam, useDeleteTeam } from "@/hooks/team.js";
import { createTeamSchema, CreateTeamInput } from "@repo/common/types";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { CategoryAssignField } from "@/components/CategoryAssignField.js";

type EditState = { id: number; name: string } | null;

export default function TeamsPage() {
  const { data: teams, isLoading } = useTeams();
  const addTeam = useAddTeam();
  const editTeam = useEditTeam();
  const deleteTeam = useDeleteTeam();

  const [editRow, setEditRow] = useState<EditState>(null);
  const [assigningTeamId, setAssigningTeamId] = useState<number | null>(null);


  // For add
  const addForm = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { name: "" },
  });

  // For edit
  const editForm = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { name: "" },
  });

  // Handle Add
  const handleAddSubmit: SubmitHandler<CreateTeamInput> = data => {
    addTeam.mutate(data, {
      onSuccess: () => addForm.reset(),
    });
  };

  // Handle Edit
  const startEdit = (teamId: number, teamName: string) => {
    setEditRow({ id: teamId, name: teamName });
    editForm.reset({ name: teamName });
  };
  const handleEditSubmit: SubmitHandler<CreateTeamInput> = data => {
    if (!editRow) return;
    editTeam.mutate(
      { id: editRow.id, name: data.name },
      {
        onSuccess: () => setEditRow(null),
      }
    );
  };
  const cancelEdit = () => setEditRow(null);

  // Delete
  const handleDelete = (id: number) => {
    if (window.confirm("Delete this team?")) {
      deleteTeam.mutate({ id });
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teams</h1>
      {/* Add Team */}
      <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="flex gap-2 mb-6">
        <Input
          {...addForm.register("name")}
          className="flex-1 border rounded p-2"
          placeholder="Add new team"
          disabled={addTeam.isPending}
        />
        <Button
          type="submit"
          className="bg-green-600 text-white px-4 rounded"
          disabled={addTeam.isPending}
        >
          Add
        </Button>
      </form>
      {addForm.formState.errors.name && (
        <div className="text-red-600 mb-4">{addForm.formState.errors.name.message}</div>
      )}

      {/* Team List */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul className="divide-y">
          {teams?.map(team =>
            editRow && editRow.id === team.id ? (
              <li key={team.id} className="py-2 flex items-center gap-2">
                <form
                  onSubmit={editForm.handleSubmit(handleEditSubmit)}
                  className="flex flex-1 items-center gap-2"
                >
                  <Input
                    {...editForm.register("name")}
                    className="flex-1 border rounded p-2"
                    disabled={editTeam.isPending}
                  />
                  <Button
                    type="submit"
                    className="bg-blue-600 text-white px-4 rounded"
                    disabled={editTeam.isPending}
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
              </li>
            ) : (
              <div>
              <li key={team.id} className="py-2 flex items-center justify-between">
                <span>{team.name}</span>
                <span className="flex gap-2">
                  <Button
                    className="text-blue-600 hover:underline"
                    onClick={() => startEdit(team.id, team.name)}
                    disabled={addTeam.isPending || editTeam.isPending}
                  >
                    Edit
                  </Button>
                  <Button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(team.id)}
                    disabled={deleteTeam.isPending}
                  >
                    Delete
                  </Button>
                  <Button
                    className="bg-yellow-500 text-white"
                    onClick={() => setAssigningTeamId(team.id)}
                  >
                    Assign Categories
                  </Button>
                </span>
              </li>
              {assigningTeamId === team.id && (
                <li className="w-full">
                  <CategoryAssignField
                    teamId={team.id}
                    initialCategories={team.categories}
                    onClose={() => setAssigningTeamId(null)}
                  />
                </li>
              )}

              </div>
            )
          )}
        </ul>
      )}
    </div>
  );
}
