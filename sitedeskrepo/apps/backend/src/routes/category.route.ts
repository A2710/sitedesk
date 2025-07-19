import express, { Router } from "express";
import { authenticateJWT, requireRole } from "@repo/common/middleware";
import { listCategories, getCategoryById, createCategory, editCategory, deleteCategory, listCategoryTeams} from "../controllers/category.controller";
const router: Router = express.Router();

// Listing all categories for respective organization
router.get("/", listCategories);

// Get a single category, this also returns the associated teams array
router.get("/:id", getCategoryById);

// Create a category
router.post("/", createCategory);

// Edit a category
router.put("/:id", editCategory);

// Delete a category
router.delete("/:id", deleteCategory);

// List teams linked to category
router.get("/:id/teams", listCategoryTeams);

export default router;
