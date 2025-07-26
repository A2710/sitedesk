import { Button } from "@/components/ui/button.js";
import clsx from "clsx";

interface BlackWhiteButtonProps {
  content: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

export function BlackWhiteButton({
  content,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: BlackWhiteButtonProps) {
  return (
    <Button
      variant="outline"
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx("bg-zinc-900 text-white", className)}
    >
      {content}
    </Button>
  );
}
