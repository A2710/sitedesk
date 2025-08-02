import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "@repo/common/types";
import type {CategoryInput} from "@repo/common/types";
import { useAddCategory, useEditCategory } from "@/hooks/category.js";
import { Input } from "@/components/ui/input.js";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form.js";
import { WhiteRedButton } from "../utils/WhiteRedButton.js";
import { BlackWhiteButton } from "../utils/BlackWhiteButton.js";

type Props =
  | {
      id?: undefined;
      defaultValues: CategoryInput;
      onSuccess: () => void;
      onClose: () => void;
    }
  | {
      id: number;
      defaultValues: CategoryInput;
      onSuccess: () => void;
      onClose: () => void;
    };

export function CategoryForm({ id, defaultValues, onClose, onSuccess }: Props) {
  const isEdit = id !== undefined;

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  const addMutation = useAddCategory();
  const editMutation = useEditCategory();

  const onSubmit = (values: CategoryInput) => {
    if (isEdit && id !== undefined) {
      editMutation.mutate({ id, name: values.name }, { onSuccess });
    } else {
      addMutation.mutate(values, { onSuccess });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row gap-1">
          <BlackWhiteButton
            className="bg-zinc-900 text-white"
            type="submit"
            disabled={addMutation.isPending || editMutation.isPending}
            content = {`${isEdit ? "Update" : "Create"} Category`}
          />
          <WhiteRedButton
            onClick={onClose}
            content="Cancel"
          />
        </div>
      </form>
    </Form>
  );
}
