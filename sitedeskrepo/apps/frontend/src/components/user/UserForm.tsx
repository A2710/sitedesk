import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  adminUserCreateSchema,
  adminUserUpdateSchema,
  AdminUserCreateInput,
  AdminUserUpdateInput,
} from "@repo/common/types";
import { useAddUser, useEditUser } from "@/hooks/users.js";
import { useTeams } from "@/hooks/team.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, // ✅ Add FormMessage for errors
} from "@/components/ui/form.js";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select.js";
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { WhiteBlackButton } from "../utils/WhiteBlackButton.js";
import { WhiteRedButton } from "@/components/utils/WhiteRedButton.js";

type Props =
  | {
      id?: undefined;
      defaultValues: AdminUserCreateInput;
      onSuccess: () => void;
    }
  | {
      id: number;
      defaultValues: AdminUserUpdateInput;
      onSuccess: () => void;
    };

export function UserForm({ id, defaultValues, onSuccess }: Props) {
  const isEdit = id !== undefined;
  const { data: teams = [] } = useTeams();
  const form = useForm({
    resolver: zodResolver(
      isEdit ? adminUserUpdateSchema : adminUserCreateSchema
    ),
    defaultValues,
  });

  const [showPassword, setShowPassword] = useState(false);

  const addMutation = useAddUser();
  const editMutation = useEditUser();

  const onSubmit = (values: AdminUserCreateInput | AdminUserUpdateInput) => {
    if (isEdit && id !== undefined) {
      editMutation.mutate({ id, data: values }, { onSuccess });
    } else {
      addMutation.mutate(values as AdminUserCreateInput, { onSuccess });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input {...field} type="email" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field (only for create) */}
        {!isEdit && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      className="relative"
                    />
                </FormControl>
                <button 
                    type="button" 
                    onClick={() => setShowPassword(showPassword => !showPassword)} 
                    className="absolute right-10 top-51 text-gray-600 hover:text-gray-900"
                >
                    {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
                </button>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isEdit && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl><Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      className="relative"
                    /></FormControl>
                <button 
                    type="button" 
                    onClick={() => setShowPassword(showPassword => !showPassword)} 
                    className="absolute right-10 top-51 text-gray-600 hover:text-gray-900"
                >
                    {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
                </button>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex flex-row gap-5">
          {/* 🔽 Role Dropdown */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <hr className="border-gray-500" />
                    <SelectItem value="AGENT">Agent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 🔽 Team Dropdown */}
          <FormField
            control={form.control}
            name="teamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team</FormLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    {teams.map((team, index) => (
                      <div key={team.id}>
                        <SelectItem value={String(team.id)}>
                          {team.name}
                        </SelectItem>
                        {index < teams.length - 1 && (
                          <hr className="my-1 border-gray-500" />
                        )}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit */}
        <div className="flex flex-row gap-2">
          <WhiteBlackButton
            type="submit"
            disabled={addMutation.isPending || editMutation.isPending}
            content={`${isEdit ? "Update" : "Create"} User`}
          ></WhiteBlackButton>
          <WhiteRedButton content="Cancel" onClick={onSuccess} />
        </div>
      </form>
    </Form>
  );
}
