import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orgDomainSchema, OrgDomainInput } from "@repo/common/types";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form.js";
import { BlackWhiteButton } from "../utils/BlackWhiteButton.js";
import { WhiteRedButton } from "../utils/WhiteRedButton.js";

export function DomainForm({
  defaultValues,
  onCancel,
  onSubmit,
}: {
  defaultValues: OrgDomainInput;
  onCancel: () => void;
  onSubmit: (values: OrgDomainInput) => void;
}) {
  const form = useForm<OrgDomainInput>({
    resolver: zodResolver(orgDomainSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domain</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row gap-1">
          <BlackWhiteButton type="submit" content="Save"/>
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
