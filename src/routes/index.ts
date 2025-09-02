import { Router } from 'express';
import authRoutes from './auth.routes.js';
import jobRoutes from './jobs.routes.js';
import applicationRoutes from './applications.routes.js';
import referralRoutes from './referrals.routes.js';
import communityRoutes from './community.routes.js';
import upskillRoutes from './upskill.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Rozgarly API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/referrals', referralRoutes);
router.use('/community', communityRoutes);
router.use('/upskill', upskillRoutes);

export default router;
