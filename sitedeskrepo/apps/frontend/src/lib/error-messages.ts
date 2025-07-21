export const SERVER_ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid input. Please check your details and try again.",
  401: "You are not authorized. Please sign in.",
  409: "An account with this email already exists.",
  500: "Something went wrong on our end. Please try again later.",
};

export function getFriendlyMessage(error: any): string {
  const status = error?.response?.status;
  if (status && SERVER_ERROR_MESSAGES[status]) {
    return SERVER_ERROR_MESSAGES[status];
  }
  return error?.response?.data?.message || error?.message || "An unknown error occurred.";
}
