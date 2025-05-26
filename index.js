import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Only this CORS config
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/user', userRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/task', taskRoutes);

// ✅ DB Connect and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error('DB connection error:', err));
