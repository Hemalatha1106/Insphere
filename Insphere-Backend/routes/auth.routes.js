import express from 'express';
import { oauthCallback } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/oauth/callback", oauthCallback);

router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working ✅' });
});

export default router;
