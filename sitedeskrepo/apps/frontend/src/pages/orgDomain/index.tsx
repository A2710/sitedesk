import { useState } from "react";
import { useOrgDomains, useAddDomain, useEditDomain, useDeleteDomain } from "@/hooks/orgDomain.js";
import { DataTable } from "@/components/ui/data-table.js";
import { columns } from "@/components/orgDomain/columns.js";
import { DomainForm } from "@/components/orgDomain/DomainForm.js";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog.js";
import { Button } from "@/components/ui/button.js";
import { WhiteBlackButton } from "@/components/utils/WhiteBlackButton.js";

export default function OrgDomainPage() {
  const { data: domains = [], isLoading } = useOrgDomains();
  const addDomain = useAddDomain();
  const editDomain = useEditDomain();
  const deleteDomain = useDeleteDomain();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<any | null>(null);

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Allowed Domains</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <WhiteBlackButton content="Add Domain"/>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DomainForm
              defaultValues={{ domain: selectedDomain?.domain ?? "" }}
              onSubmit={(values) => {
                if (selectedDomain) {
                  editDomain.mutate({ id: selectedDomain.id, data: values }, { onSuccess: () => setIsOpen(false) });
                } else {
                  addDomain.mutate(values, { onSuccess: () => setIsOpen(false) });
                }
              }}
              onCancel={() => setIsOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          columns={columns({
            onEdit: (domain) => {
              setSelectedDomain(domain);
              setIsOpen(true);
            },
            onDelete: (id) => deleteDomain.mutate(id),
          })}
          data={domains}
        />
      )}
    </div>
  );
}
