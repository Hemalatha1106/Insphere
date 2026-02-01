import express from "express";
import { setupProfile, updateProfile, syncProfile, getMyProfile } from "../controllers/profile.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/setup", authMiddleware, setupProfile);
router.put("/update", authMiddleware, updateProfile);
router.post("/sync", authMiddleware, syncProfile);
router.get("/me", authMiddleware, getMyProfile);

export default router;
