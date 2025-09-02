import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { verifyFirebaseToken, requireAdmin } from '../middlewares/auth.js';
import { validateDto, validateParams } from '../middlewares/validateDto.js';
import { CreateUserDto, UpdateUserDto, IdParamDto } from '../dtos/auth.dto.js';
import { UserRole } from '../models/User.js';
import { z } from 'zod';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/users', validateDto(CreateUserDto), authController.createUser);

// Protected routes
router.use(verifyFirebaseToken);

// User profile routes
router.get('/profile', authController.getUserProfile);
router.put('/profile', validateDto(UpdateUserDto), authController.updateUserProfile);
router.delete('/profile', authController.deleteUser);
router.get('/profile/stats', authController.getUserStats);
router.post(
  '/profile/skills',
  validateDto(z.object({ skills: z.array(z.string()) })),
  authController.addUserSkills
);

// Admin only routes
router.put(
  '/users/:uid/role',
  requireAdmin,
  validateParams(IdParamDto),
  validateDto(z.object({ role: z.nativeEnum(UserRole) })),
  authController.updateUserRole
);

export default router;
