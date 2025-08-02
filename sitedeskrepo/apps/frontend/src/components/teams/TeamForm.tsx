import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {CreateTeamInput} from "@repo/common/types";
import { createTeamSchema } from "@repo/common/types";
import { Input } from "@/components/ui/input.js";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form.js";
import { WhiteBlackButton } from "../utils/WhiteBlackButton.js";
import { WhiteRedButton } from "../utils/WhiteRedButton.js";

export function TeamForm({
  defaultValues,
  onCancel,
  onSubmit,
}: {
  defaultValues: CreateTeamInput;
  onCancel: () => void;
  onSubmit: (values: CreateTeamInput) => void;
}) {
  const form = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Sales Team" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row gap-1">
          <WhiteBlackButton 
            type="submit"
            content="Save"
          />
          <WhiteRedButton
            type="button"
            content="Cancel"
            onClick={() => {
              form.reset();
              onCancel();
            }}
          />
        </div>
      </form>
    </Form>
  );
}
