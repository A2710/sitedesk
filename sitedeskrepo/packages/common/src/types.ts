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


//for user
export interface JwtPayload {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
  organizationId: number;
}

export interface AuthResponse {
  token: string;
  user: JwtPayload;
}

//
// ── ORG DOMAIN ────────────────────────────────────────────────────────────────

export type OrganizationBase = {
  id: number;
  name: string;
  createdAt: Date;
};


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

// FOR CATEGORY OUTPUT

export interface categoriesOutput {
    id: number;
    name: string;
    organizationId: number;
}

export type editCategoryInput = Pick<categoriesOutput, 'id' | 'name'>;
export type deleteCategoryInput = Pick<categoriesOutput, 'id'>;

//
// ── USER ────────────────────────────────────────────────────────
//
export const adminUserCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email format"),
  role: z.enum(["ADMIN", "AGENT"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
  teamId: z.number().int().positive().optional(),
});
export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>;

export interface AdminUserCreateOutput {
  id: Number;
  name: String;
  email: String;
  role: 'ADMIN' | 'AGENT';
  teamid?: Number | undefined;
}

export const adminUserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email("Invalid email format").optional(),
  role: z.enum(["ADMIN", "AGENT"]).optional(),
  password: z.string().min(8).optional(),
  isOnline: z.boolean().optional(),
  teamId: z.number().int().positive().optional(),
});
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;

export interface TeamInfo {
  id: number;
  name: string;
  organizationId: number;
  createdAt: Date; // Date serialized to string
}

export interface GetMeResponse {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
  isOnline: boolean;
  createdAt: Date;
  teamsDataArray: TeamInfo[];
  organizationId?: number;
}


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

export interface ListTeamsCategory {
  categoryId: number;
  categoryName: string;
}

export interface ListTeamsMember {
  userId: number;
  userName: string;
}

export interface ListTeamsOutput {
  id: number;
  name: string;
  categories: ListTeamsCategory[];
  members: ListTeamsMember[];
}

export interface TeamCreateOutput {
  id: number;
  name: string;
  organizationId: number;
  createdAt: Date; // or Date, depending on your API serialization
}


//
// ── CUSTOMERS & WIDGET ────────────────────────────────────────────────────────
//
export const customerSchema = z.object({
  name: z.string().min(2, "Name too short").max(100, "Name too long"),
  email: z.string().email("Invalid email format"),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const startChatSchema = z.object({
  categoryId: z.number().int().positive(),
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

export interface Customer {
  id: number;
  name?: string;
  email?: string;
}

export interface Chat {
  id: number;
  customerId: number;
  customer?: Customer;
  // Add category, status etc as needed
}

export type SenderType = "AGENT" | "CUSTOMER";

export interface Message {
  id: number;
  chatId: number;
  content: string;
  senderId: number;
  senderType: SenderType;
  receiverId: number;
  receiverType: SenderType;
  createdAt: string; // ISO date string
}


//
// ── FEEDBACK ──────────────────────────────────────────────────────────────────
//
export const submitFeedbackSchema = z.object({
  chatId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
