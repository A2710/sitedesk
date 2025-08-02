import { useAgentChatStore } from "@/stores/agentChatStore.js";
import { socket } from "@/hooks/useAgentSocket";
import { Button } from "@/components/ui/button.js";
import { ConfirmDialog } from "@/components/utils/confirmDialog.js"; // adjust the import path as needed

export function CompleteChatButton() {
  const currentChatId = useAgentChatStore((s) => s.currentChatId);

  if (!currentChatId) return null;

  return (
    <ConfirmDialog
      message="Are you sure you want to mark this chat as completed? This action cannot be undone."
      onConfirm={() => {
        if (socket && currentChatId) {
          socket.emit("complete_chat", { chatId: currentChatId });
        }
      }}
      trigger={
        <Button
          className="bg-green-500 text-white font-extrabold text-xs py-0 px-4 ms-2"
        >
          Complete Chat
        </Button>
      }
    />
  );
}
