export function useRoleMenu(role: string) {
  const baseMenu = [
    { to: "/", label: "Dashboard" }
  ];

  const adminMenu = [
    { to: "/users", label: "Manage Users" },
    { to: "/settings", label: "Settings" },
    { to: "/categories", label: "Categories"},
    { to: "/teams", label: "Teams"},
  ];

  const agentMenu = [
    { to: "/my-chats", label: "My Chats" },
  ];

  let roleMenu: any = [];
  if (role === "ADMIN") roleMenu = adminMenu;
  else if (role === "AGENT") roleMenu = agentMenu;

  // Merge with base menu and return
  return [...baseMenu, ...roleMenu];
}
