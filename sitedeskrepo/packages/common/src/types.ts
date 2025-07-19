import { z } from "zod";

//
// ── AUTH ───────────────────────────────────────────────────────────────────────
//
export const userSignup = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email format"),
  organizationName: z.string().min(1, "Organization name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type UserSignupInput = z.infer<typeof userSignup>;

export const userSignin = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});
export type UserSigninInput = z.infer<typeof userSignin>;

//
// ── ORG DOMAIN ────────────────────────────────────────────────────────────────
//
export const orgDomainSchema = z.object({
  domain: z
    .string()
    .min(3)
    .max(253)
    .regex(
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/,
      "Invalid domain format"
    ),
});
export type OrgDomainInput = z.infer<typeof orgDomainSchema>;

//
// ── CATEGORIES ────────────────────────────────────────────────────────────────
//
export const categorySchema = z.object({
  name: z.string().min(2, "Category name too short").max(50, "Category name too long"),
});
export type CategoryInput = z.infer<typeof categorySchema>;

//
// ── ADMIN USER (AGENT) ─────────────────────────────────────────────────────────
//
export const adminUserCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email format"),
  role: z.enum(["ADMIN", "AGENT"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
  teamId: z.number().int().positive().optional(),
});
export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>;

export const adminUserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email("Invalid email format").optional(),
  role: z.enum(["ADMIN", "AGENT"]).optional(),
  password: z.string().min(8).optional(),
  isOnline: z.boolean().optional(),
  teamId: z.number().int().positive().optional(),
});
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;

//
// ── TEAMS ─────────────────────────────────────────────────────────────────────
//
export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name too short").max(50, "Team name too long"),
});
export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const assignCategoriesToTeamSchema = z.object({
  categoryIds: z.array(z.number().int().positive()).min(1, "At least one categoryId required"),
});
export type AssignCategoriesToTeamInput = z.infer<typeof assignCategoriesToTeamSchema>;

export const assignAgentsToTeamSchema = z.object({
  userIds: z.array(z.number().int().positive()).min(1, "At least one userId required"),
});
export type AssignAgentsToTeamInput = z.infer<typeof assignAgentsToTeamSchema>;

//
// ── CUSTOMERS & WIDGET ────────────────────────────────────────────────────────
//
export const customerSchema = z.object({
  name: z.string().min(2, "Name too short").max(100, "Name too long"),
  email: z.string().email("Invalid email format"),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const startChatSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  initialMessage: z.string().optional(),
});
export type StartChatInput = z.infer<typeof startChatSchema>;

//
// ── AGENT CHAT ────────────────────────────────────────────────────────────────
//
export const assignChatSchema = z.object({
  agentId: z.number().int().positive().optional(),
});
export type AssignChatInput = z.infer<typeof assignChatSchema>;

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const addCustomerNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
});
export type AddCustomerNoteInput = z.infer<typeof addCustomerNoteSchema>;

//
// ── FEEDBACK ──────────────────────────────────────────────────────────────────
//
export const submitFeedbackSchema = z.object({
  chatId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
