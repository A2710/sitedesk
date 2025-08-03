import { useWidgetStore } from "@/hooks/useWidgetStore";
import { useWidgetApi } from "@/hooks/useWidgetApis";
import { Button } from "@/components/ui/button";

export function WidgetEndChatButton({ chatId }: { chatId: string }) {
  const setStatus = useWidgetStore((s) => s.setStatus);
  const { endChatMutation } = useWidgetApi();

  function handleEnd() {
    endChatMutation.mutate(chatId, {
      onSuccess: () => {
        setStatus("EXIT");
      }
    });
  }

  return (
    <Button
      onClick={handleEnd}
      size="sm"
      variant={"outline"}
      className="mt-2 w-full bg-red-600 text-white font-bold"
      disabled={endChatMutation.isPending}
    >
      {endChatMutation.isPending ? "Ending..." : "End Chat"}
    </Button>
  );
}
