import { useState } from "react";
import { useWidgetApi } from "@/hooks/useWidgetApis";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import { Alert, AlertDescription } from "@/components/ui/alert.js";

export function WidgetLoginForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { loginMutation } = useWidgetApi();
  const [error, setError] = useState<string | null>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    loginMutation.mutate(
      { name, email },
      {
        onError: (err: any) => {
          setError(err?.response?.data?.message || "Login failed");
        },
      }
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleLogin}>
      <Input
        placeholder="Name"
        required
        value={name}
        onChange={e => setName(e.target.value)}
        autoComplete="name"
      />
      <Input
        placeholder="Email"
        required
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        autoComplete="email"
      />
      <Button type="submit" size="sm" className="w-full">
        Start
      </Button>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription className="text-red-500">{error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
