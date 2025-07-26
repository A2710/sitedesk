import { Button } from "@/components/ui/button.js";
import clsx from "clsx";

interface WhiteBlackButtonProps {
  content: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

export function WhiteBlackButton({
  content,
  onClick,
  type = "button",
  disabled = false,
  className = ""
}: WhiteBlackButtonProps) {
  return (
    <Button
      variant="outline"
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx("hover:bg-zinc-900 hover:text-white", className)}
    >
      {content}
    </Button>
  );
}
