import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "../../hooks/auth.js";
import { userSignup, UserSignupInput } from "@repo/common/types";
import { AuthFormWrapper } from "../../components/auth/AuthFormWrapper.js";
import { FormError } from "../../components/FormError.js";
import { getFriendlyMessage } from "@/lib/error-messages.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";

export default function SignUpPage() {
  const { register, handleSubmit, formState } = useForm<UserSignupInput>({
    resolver: zodResolver(userSignup),
  });
  const mutation = useSignUp();

  const onSubmit = (data: UserSignupInput) => {
    mutation.mutate(data);
  };

  return (
    <AuthFormWrapper title="Sign Up">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        autoComplete="on"
      >
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name")}
            aria-invalid={!!formState.errors.name}
          />
          {formState.errors.name && (
            <p className="text-red-500 text-xs mt-1">{formState.errors.name.message}</p>
          )}
        </div>

        {/* Organization Name */}
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input
            id="organizationName"
            type="text"
            autoComplete="organization"
            {...register("organizationName")}
            aria-invalid={!!formState.errors.organizationName}
          />
          {formState.errors.organizationName && (
            <p className="text-red-500 text-xs mt-1">{formState.errors.organizationName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            aria-invalid={!!formState.errors.email}
          />
          {formState.errors.email && (
            <p className="text-red-500 text-xs mt-1">{formState.errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            aria-invalid={!!formState.errors.password}
          />
          {formState.errors.password && (
            <p className="text-red-500 text-xs mt-1">{formState.errors.password.message}</p>
          )}
        </div>

        {/* Form error */}
        <FormError error={mutation.isError ? getFriendlyMessage(mutation.error) : undefined} />

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full bg-zinc-900 text-white" 
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <span className="animate-spin inline-block mr-2">⏳</span>
              Signing up...
            </>
          ) : (
            "Sign Up"
          )}
        </Button>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span>
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-600 hover:underline font-medium">
              Sign In
            </Link>
          </span>
        </div>
      </form>
    </AuthFormWrapper>
  );
}
