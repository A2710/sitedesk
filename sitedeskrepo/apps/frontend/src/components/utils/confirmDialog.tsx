import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.js";
import { Button } from "@/components/ui/button.js";

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  trigger: ReactNode; // element that opens the dialog
}

export function ConfirmDialog({ message, onConfirm, trigger }: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Confirmation</DialogTitle>
        </DialogHeader>
        <p>{message}</p>
        <DialogFooter className="flex justify-end gap-2">
          <Button className="hover:bg-zinc-900 hover:text-white" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-red-100 text-red-700 hover:bg-red-700 hover:text-red-100"
            variant={"outline"}
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
