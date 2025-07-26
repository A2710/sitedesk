import apiClient from "@/api/apiClient.js";

async function validateDomain() {
  const currentDomain = window.location.hostname;
  const { data: allowedDomains } = await apiClient.get("/orgDomain");
  if (!allowedDomains.some((d: any) => d.domain === currentDomain)) {
    throw new Error("This domain is not authorized to use the chat widget");
  }
}
