import express, { Router } from "express";
import { authenticateJWT, requireCustomer, requireRole, resolveOrgFromDomain} from "@repo/common/middleware";
import {
  widgetCustomerLogin,
  widgetStartChat,
  widgetGetChats,
  widgetGetChatMessages,
  widgetGetCategories
} from "../controllers/widget.controller";

const router: Router = express.Router();

// Always resolve org first for login
router.post("/customer/login", resolveOrgFromDomain, widgetCustomerLogin);
router.post("/categories", authenticateJWT, requireCustomer, widgetGetCategories);
// The rest require the customer to be authenticated (JWT, set by login above)
router.post("/chat/start", authenticateJWT, requireCustomer, widgetStartChat);
router.get("/chat", authenticateJWT, requireCustomer, widgetGetChats);
router.get("/chat/:chatId/messages", authenticateJWT, requireCustomer, widgetGetChatMessages);

export default router;
