import express, { Router } from "express";
import { getOrganizationDetails } from "../controllers/org.controller";

const router: Router = express.Router();

router.get("/:id", getOrganizationDetails);

export default router;
