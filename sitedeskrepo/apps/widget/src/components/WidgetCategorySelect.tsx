import { useWidgetStore } from "@/hooks/useWidgetStore";
import { useWidgetApi } from "@/hooks/useWidgetApis";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent } from "@/components/ui/card.js";
import type { WidgetCategory } from "@repo/common/types";
import type { UseQueryResult } from "@tanstack/react-query";

export function WidgetCategorySelect() {
  const setCurrentChat = useWidgetStore((s) => s.setCurrentChat);
  const setStatus = useWidgetStore((s) => s.setStatus);
  const customer = useWidgetStore((s) => s.customer);
  const { useCategories, startChatMutation } = useWidgetApi();
  const { data: categories = [] } = useCategories as UseQueryResult<WidgetCategory[]>;

  function startChat(categoryId: number) {
    startChatMutation.mutate(categoryId, {
      onSuccess: (res) => {
        setCurrentChat({
          id: res.chatId,
          status: res.status,
          categoryId,
          createdAt: new Date().toISOString(),
          customerId: customer?.id ?? 0,
        });
        setStatus("IN_CHAT");
      },
    });
  }

  if (categories.length === 0)
    return (
      <Card>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            No categories available.
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-3 text-lg font-medium text-center">Select a Category to Chat:</div>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => startChat(cat.id)}
              className="w-full"
              variant="secondary"
              size="sm"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
