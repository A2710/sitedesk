import { Button } from "@/components/ui/button.js";
import clsx from "clsx";

interface WhiteBlueButtonProps {
  content: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

export function WhiteBlueButton({
  content,
  onClick,
  type = "button",
  disabled = false,
  className = ""
}: WhiteBlueButtonProps) {
  return (
    <Button
      variant="outline"
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx("bg-blue-100 text-blue-700 hover:bg-blue-700 hover:text-blue-100", className)}
    >
      {content}
    </Button>
  );
}
