import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import communityRoutes from './routes/community.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);

app.get('/', (req, res) => {
  res.send('Insphere backend is running 🚀');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Insphere server running on port ${PORT}`);
});
