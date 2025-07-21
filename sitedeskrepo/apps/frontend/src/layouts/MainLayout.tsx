import React from "react";
import { Outlet } from "react-router-dom";
import { useCurrentUser } from "../api/auth.js";
import { Sidebar } from "../components/SideBar.js";
import { Topbar } from "../components/TopBar.js";

export default function MainLayout() {
  const { data: currentUser, isLoading } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (!currentUser) return <div>Unauthorized</div>;

  const { role, name } = currentUser;

  return (
    <div className="flex min-h-screen bg-gray">
      <Sidebar role={role} name={name} />
      <div className="flex-1 flex flex-col">
        <Topbar name={name} />
        <main className="flex-1 p-8 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
