import express, { Router } from "express";
import { authenticateJWT, requireRole } from "@repo/common/middleware";
import {
  listCustomers,
  getCustomerById,
  updateCustomer,
} from "../controllers/customer.management.controller";

const router: Router = express.Router();

router.use(authenticateJWT); // Adjust if agents should access

router.get("/", listCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);

export default router;
