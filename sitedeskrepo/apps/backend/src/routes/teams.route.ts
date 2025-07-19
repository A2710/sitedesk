import express, { Router } from "express";
import { authenticateJWT, requireRole } from "@repo/common/middleware";
import {
  listTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  assignCategoriesToTeam,
  assignAgentsToTeam
} from "../controllers/teams.controller";

const router: Router = express.Router();

router.get("/", listTeams);                     // Listing all teams (with cats/agents)
router.get("/:id", getTeamById);                // Getting single team with details
router.post("/", requireRole("ADMIN"), createTeam);                   // Creating team
router.put("/:id", requireRole("ADMIN"), updateTeam);                 // Editing team
router.delete("/:id", requireRole("ADMIN"), deleteTeam);              // Deleting team
router.post("/:id/categories", requireRole("ADMIN"), assignCategoriesToTeam); // Assign categories (replace all)
router.post("/:id/agents", requireRole("ADMIN"), assignAgentsToTeam);         // Assign agents (replace all)

export default router;