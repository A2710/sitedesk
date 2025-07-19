import express, { Router } from "express";
import {
  listMyChats,
  getChatById,
  agentSendMessage,
  listWaitingChats,
  agentAssignChat,
  listAllOrgChats,
  agentGetChatMessages,
  closeChat,
  addCustomerNote
} from "../controllers/agent.chat.controller";
import { authenticateJWT, requireRole } from "@repo/common/middleware";

const router: Router = express.Router();

router.use(authenticateJWT, requireRole("AGENT", "ADMIN"));

router.get("/", listAllOrgChats);
router.get("/my", listMyChats);
router.get("/waiting", listWaitingChats);
router.get("/:chatId", getChatById);

router.post("/:chatId/assign", requireRole("ADMIN", "AGENT"), agentAssignChat);
router.post("/:chatId/messages", agentGetChatMessages);
router.post("/:chatId/message", agentSendMessage);
router.post("/:chatId/close", closeChat);

router.post("/:chatId/note", addCustomerNote);

export default router;
