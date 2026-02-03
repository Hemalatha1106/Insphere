import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import communityRoutes from './routes/community.routes.js';
import profileRoutes from "./routes/profile.routes.js";
import leaderboardRoutes from './routes/leaderboard.routes.js';

// Import Scheduler (Notice the .js extension and import syntax)
import initScheduler from './services/scheduler.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize the Cron Job
initScheduler(); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/', (req, res) => {
  res.send('Insphere backend is running 🚀');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Insphere server running on port ${PORT}`);
});