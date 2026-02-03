import express from 'express';
import { getGlobalLeaderboard } from '../controllers/leaderboard.controller.js';

const router = express.Router();

router.get('/global', getGlobalLeaderboard);

export default router;