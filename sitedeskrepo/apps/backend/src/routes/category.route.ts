import express, { Router } from "express";
import { authenticateJWT, requireRole } from "@repo/common/middleware";
import { listCategories, getCategoryById, createCategory, editCategory, deleteCategory, listCategoryTeams} from "../controllers/category.controller";

const router: Router = express.Router();
router.get("/", listCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.put("/:id", editCategory);
router.delete("/:id", deleteCategory);
router.get("/:id/teams", listCategoryTeams);

export default router;
