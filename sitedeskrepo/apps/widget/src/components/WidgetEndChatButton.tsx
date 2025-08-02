import { useWidgetStore } from "@/hooks/useWidgetStore";
import { useWidgetApi } from "@/hooks/useWidgetApis";
import { Button } from "@/components/ui/button";

export function WidgetEndChatButton({ chatId }: { chatId: string }) {
  const setStatus = useWidgetStore((s) => s.setStatus);
  const resetStore = useWidgetStore((s) => s.reset);   // <-- get reset action
  const { endChatMutation } = useWidgetApi();

  function handleEnd() {
    endChatMutation.mutate(chatId, {
      onSuccess: () => {
        setStatus("ENDED");
        // Optionally delay/reset for user feedback
        setTimeout(() => {
          resetStore();   // <-- clear Zustand state after chat ends
        }, 1000); // show 'Thank you' for a sec, then clear
      }
    });
  }

  return (
    <Button
      onClick={handleEnd}
      variant="destructive"
      size="sm"
      className="mt-2 w-full"
      disabled={endChatMutation.isPending}
    >
      {endChatMutation.isPending ? "Ending..." : "End Chat"}
    </Button>
  );
}
