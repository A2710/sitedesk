import express, { Router } from "express";
import {authenticateJWT, requireRole} from "@repo/common/middleware";
import { deleteDomain, editDomain, getDomainById, listDomains, registerDomain } from "../controllers/orgDomain.controller";
const router: Router = express.Router();

router.get("/", listDomains);
router.get("/:id", getDomainById);
router.post("/", registerDomain);
router.put("/:id", editDomain);
router.delete("/:id", deleteDomain);
export default router;