import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn } from "../../api/auth.js";
import { userSignin, UserSigninInput } from "@repo/common/types";
import { AuthFormWrapper } from "../../components/AuthFormWrapper.js";
import { FormError } from "../../components/FormError.js";
import { getFriendlyMessage } from "@/lib/error-messages.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js"; // optional but recommended

export default function SignInPage() {
  const { register, handleSubmit, formState } = useForm<UserSigninInput>({
    resolver: zodResolver(userSignin),
  });
  const mutation = useSignIn();

  const onSubmit = (data: UserSigninInput) => {
    mutation.mutate(data);
  };

  return (
    <AuthFormWrapper title="Sign In">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        autoComplete="on"
      >
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
            autoComplete="current-password"
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
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span>
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline font-medium">
              Sign Up
            </Link>
          </span>
          {/* You could add a forgot password link here */}
        </div>
      </form>
    </AuthFormWrapper>
  );
}
