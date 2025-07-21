  import express, { Router } from "express";
  import {authenticateJWT, requireRole} from "@repo/common/middleware";
  import agentChatRoutes from "./agent.chat.route";
  import {
    listUsers,
    getMe,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  } from "../controllers/user.controller";

  const router : Router = express.Router();

  router.get("/", requireRole("ADMIN"), listUsers);
  router.get("/me", getMe);
  router.get("/:id", requireRole("ADMIN"), getUserById);
  router.post("/", requireRole("ADMIN"), createUser);
  router.put("/:id", updateUser);
  router.delete("/:id", requireRole("ADMIN"), deleteUser);
  router.use("/chats", agentChatRoutes);

  export default router;
