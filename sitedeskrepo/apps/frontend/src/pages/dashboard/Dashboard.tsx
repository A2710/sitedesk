import { useCurrentUser, useOrganization } from "@/hooks/auth.js";

export default function Dashboard() {
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();

  const { data: currentOrg, isLoading: isLoadingOrg } = useOrganization(
    currentUser?.organizationId
  );
  console.log(currentUser);
  console.log("---------------");
  console.log(currentOrg);

  if (isLoadingUser || isLoadingOrg) return <h1>Loading...</h1>;

  return (
    <div className="text-sm font-semibold">
      <h1>Welcome, {currentUser?.name}</h1>
      <p>Organization: {currentOrg?.name}</p>
    </div>
  );
}
