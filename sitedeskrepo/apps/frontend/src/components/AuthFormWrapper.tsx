import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";

export const AuthFormWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="w-full h-dvh flex items-center justify-center bg-zinc-900">
    <Card className="w-full max-w-md bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  </div>
);
