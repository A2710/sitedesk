import React from "react";
import { Link } from "react-router-dom";
import { useRoleMenu } from "../hooks/useRoleMenu.js";

export function Sidebar({ role, name }: { role: string; name: string }) {
  const menu = useRoleMenu(role);

  return (
    <aside className="w-64 bg-gray-100 p-4 min-h-screen">
      <h2 className="font-bold text-lg mb-6">My App</h2>
      <nav>
        <ul className="space-y-2">
          {menu.map(item => (
            <li key={item.to}>
              <Link to={item.to} className="block px-2 py-1 rounded hover:bg-blue-50">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8 text-xs text-gray-500">Logged in as: {name}</div>
    </aside>
  );
}
