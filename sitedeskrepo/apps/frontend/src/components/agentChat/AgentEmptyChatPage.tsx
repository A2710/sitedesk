import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";

export function AgentEmptyChatPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>No chats in the queue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Wait for a customer to join and try again.</p>
        </CardContent>
      </Card>
    </div>
  );
}
