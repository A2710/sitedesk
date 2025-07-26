import React from "react";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";

type AuthInputProps = {
  label: string;
  type?: string;
  error?: string;
  id?: string;
  [x: string]: any; // For react-hook-form register and other input props
};

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  type = "text",
  error,
  id,
  ...rest
}) => {
  // Generate a unique id if not provided (for accessibility)
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-1">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        type={type}
        {...rest}
        autoComplete={type}
        // shadcn Input already includes nice styling
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};
