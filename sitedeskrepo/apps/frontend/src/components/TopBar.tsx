import React from "react";

export function Topbar({ name }: { name: string }) {
  return (
    <header className="bg-gray-50 shadow p-4 flex justify-end">
      <div className="text-sm font-semibold">Welcome, {name}</div>
      {/* Add logout button, notifications, etc. here */}
    </header>
  );
}
