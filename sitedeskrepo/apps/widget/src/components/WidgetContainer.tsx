import { useWidgetStore } from "@/hooks/useWidgetStore";
import { WidgetLoginForm } from "./WidgetLoginForm.js";
import { WidgetCategorySelect } from "./WidgetCategorySelect.js";
import { WidgetChatWindow } from "./WidgetChatWindow.js";

export function WidgetContainer() {
  const status = useWidgetStore((s) => s.status);

  if (status === "INIT") return <WidgetLoginForm />;
  if (status === "LOGGED_IN") return <WidgetCategorySelect />;
  if (status === "IN_CHAT") return <WidgetChatWindow />;
  if (status === "ENDED") return <div>Thank you! Your chat has ended.</div>;

  return <div>Loading...</div>;
}
