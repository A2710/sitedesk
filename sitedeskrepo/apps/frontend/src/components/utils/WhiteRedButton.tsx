import { Button } from "@/components/ui/button.js";
import clsx from "clsx";

interface RedButtonProps {
  content: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

export function WhiteRedButton({
  content,
  onClick,
  type = "button",
  disabled = false,
  className = ""
}: RedButtonProps) {
  return (
    <Button
      variant="outline"
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx("bg-red-100 text-red-700 hover:bg-red-700 hover:text-red-100", className)}
    >
      {content}
    </Button>
  );
}
