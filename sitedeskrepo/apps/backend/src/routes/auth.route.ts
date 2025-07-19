import express, { Router } from "express";
import {signin, signup, logout} from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);

export default router;