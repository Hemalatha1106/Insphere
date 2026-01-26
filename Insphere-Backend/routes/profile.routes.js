import express from "express";
import { setupProfile } from "../controllers/profile.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/setup", authMiddleware, setupProfile);

export default router;
