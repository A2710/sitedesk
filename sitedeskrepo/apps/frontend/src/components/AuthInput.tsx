import React from "react";

type AuthInputProps = {
  label: string;
  type?: string;
  error?: string;
  [x: string]: any; // For react-hook-form register and other input props
};

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  type = "text",
  error,
  ...rest
}) => (
  <div className="mb-4">
    <label className="block text-gray-700">{label}</label>
    <input
      type={type}
      {...rest}
      className="mt-1 block w-full border rounded p-2"
      autoComplete={type}
    />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);
