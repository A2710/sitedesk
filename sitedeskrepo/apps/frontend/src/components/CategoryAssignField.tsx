import React, { useState, useMemo } from "react";
import { useAssignCategoriesToTeam } from "@/hooks/team.js";
import { useCategories } from "@/hooks/category.js";
import { Badge } from "@/components/ui/badge.js";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command.js";
import { Button } from "@/components/ui/button.js";
import { ListTeamsCategory } from "@repo/common/types";

interface CategoryAssignFieldProps {
  teamId: number;
  initialCategories: ListTeamsCategory[];
  onClose: () => void;
}

export const CategoryAssignField: React.FC<CategoryAssignFieldProps> = ({
  teamId,
  initialCategories,
  onClose
}) => {
  const { data: allCategories = [] } = useCategories();
  const assignCategories = useAssignCategoriesToTeam();

  // State for selected categories (by id)
  const [selectedIds, setSelectedIds] = useState<number[]>(initialCategories.map(tc => tc.categoryId));

  // Map for id -> name (for pills and dropdown)
  const idToName = useMemo(
    () => new Map(allCategories.map(c => [c.id, c.name])),
    [allCategories]
  );

  // Categories available for selection in combobox (not yet assigned)
  const unselectedCategories = allCategories.filter(
    c => !selectedIds.includes(c.id)
  );

  // Add on select
  const handleAdd = (id: number) => {
    if (!selectedIds.includes(id)) setSelectedIds([...selectedIds, id]);
  };

  // Remove on pill click
  const handleRemove = (id: number) => {
    setSelectedIds(selectedIds.filter(cid => cid !== id));
  };

  // Assign on button click
  const handleAssign = () => {
    assignCategories.mutate(
        { id: teamId, categoryIds: selectedIds },
        { onSuccess: onClose }
    );
  };

  return (
    <div className="pb-4">
      {/* Combobox, full width of row */}
      <Command>
        <CommandInput placeholder="Search categories..." />
        <CommandList>
          {unselectedCategories.length === 0 ? (
            <CommandItem disabled>No more categories</CommandItem>
          ) : (
            unselectedCategories.map(cat => (
              <CommandItem key={cat.id} value={cat.name} onSelect={() => handleAdd(cat.id)}>
                {cat.name}
              </CommandItem>
            ))
          )}
        </CommandList>
      </Command>

      {/* Pills (assigned categories) */}
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedIds.length === 0 ? (
          <span className="text-gray-400">No categories assigned</span>
        ) : (
          selectedIds.map(id => (
            <Badge
              key={id}
              className="flex items-center gap-1"
              variant="outline"
              onClick={() => handleRemove(id)}
              style={{ cursor: "pointer" }}
              title="Remove"
            >
              {idToName.get(id) || id}
              <span className="ml-1 text-red-600 font-bold">×</span>
            </Badge>
          ))
        )}
      </div>

      {/* Save button */}
      <Button
        onClick={handleAssign}
        disabled={assignCategories.isPending}
        className="mt-4 bg-green-500"
      >
        Assign Categories
      </Button>

        <Button
            variant="outline"
            onClick={onClose}
            className="mt-2 ml-2"
        >
            Close
        </Button>
    </div>
  );
};
