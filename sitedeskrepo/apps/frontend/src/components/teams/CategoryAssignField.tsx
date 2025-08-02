import React, { useState, useMemo } from "react";
import { useAssignCategoriesToTeam } from "@/hooks/team.js";
import { useCategories } from "@/hooks/category.js";
import { Badge } from "@/components/ui/badge.js";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command.js";
import type { ListTeamsCategory } from "@repo/common/types";
import { WhiteBlackButton } from "../utils/WhiteBlackButton.js";
import { WhiteRedButton } from "../utils/WhiteRedButton.js";
import { X } from "lucide-react";

interface CategoryAssignFieldProps {
  teamId: number;
  initialCategories: ListTeamsCategory[];
  onClose: () => void;
}

export const CategoryAssignField: React.FC<CategoryAssignFieldProps> = ({
  teamId,
  initialCategories,
  onClose,
}) => {
  const { data: allCategories = [] } = useCategories();
  const assignCategories = useAssignCategoriesToTeam();

  const [selectedIds, setSelectedIds] = useState<number[]>(
    initialCategories.map((tc) => tc.categoryId)
  );

  const idToName = useMemo(
    () => new Map(allCategories.map((c) => [c.id, c.name])),
    [allCategories]
  );

  const unselectedCategories = allCategories.filter(
    (c) => !selectedIds.includes(c.id)
  );

  const handleAdd = (id: number) => {
    if (!selectedIds.includes(id)) setSelectedIds([...selectedIds, id]);
  };

  const handleRemove = (id: number) => {
    setSelectedIds(selectedIds.filter((cid) => cid !== id));
  };

  const handleAssign = () => {
    assignCategories.mutate(
      { id: teamId, categoryIds: selectedIds },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="pb-4 bg-white">
      {/* Search and select categories */}
      <Command>
        <CommandInput placeholder="Search categories..." />
        <CommandList>
          {unselectedCategories.length === 0 ? (
            <CommandItem disabled>No more categories</CommandItem>
          ) : (
            unselectedCategories.map((cat) => (
              <CommandItem
                key={cat.id}
                value={cat.name}
                onSelect={() => handleAdd(cat.id)}
                className="bg-gray-300 border-box mb-0.5"
              >
                {cat.name}
              </CommandItem>
            ))
          )}
        </CommandList>
      </Command>

      {/* Pills for selected categories */}
      <hr className="border-gray-500 mt-3"/>
      <div className="text-gray-500 text-xs pt-2 ps-1">assignCategories</div>
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedIds.length === 0 ? (
          <span className="text-gray-400">No categories assigned</span>
        ) : (
          selectedIds.map((id) => (
            <Badge
              key={id}
              className="flex items-center gap-1 p-2 rounded-full bg-zinc-900 text-white ps-4 pe-4"
              variant="outline"
              onClick={() => handleRemove(id)}
              style={{ cursor: "pointer" }}
              title="Remove"
            >
              {idToName.get(id) || id}
              <span className="ml-1 text-white font-bold"><X size={14}></X></span>
            </Badge>
          ))
        )}
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-2">
        <WhiteBlackButton
          onClick={handleAssign}
          disabled={assignCategories.isPending}
          content="Assign Categories"
        />
        <WhiteRedButton 
          onClick={onClose}
          content="Close"
        />
      </div>
    </div>
  );
};
