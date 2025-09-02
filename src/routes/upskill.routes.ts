import { Router } from 'express';
import { UpskillController } from '../controllers/UpskillController.js';
import { verifyFirebaseToken, requireAdmin } from '../middlewares/auth.js';
import { validateDto, validateQuery, validateParams } from '../middlewares/validateDto.js';
import { CreateCourseDto, UpdateCourseDto, GetCoursesDto, IdParamDto } from '../dtos/upskill.dto.js';
import { z } from 'zod';

const router = Router();
const upskillController = new UpskillController();

// Public routes
router.get('/courses', validateQuery(GetCoursesDto), upskillController.getCourses);
router.get('/courses/free', upskillController.getFreeCourses);
router.get('/courses/search', upskillController.searchCourses);
router.get('/courses/stats', upskillController.getCourseStats);
router.get('/courses/provider/:provider', validateParams(z.object({ provider: z.string() })), upskillController.getCoursesByProvider);
router.get('/courses/level/:level', validateParams(z.object({ level: z.string() })), upskillController.getCoursesByLevel);
router.get('/courses/:id', validateParams(IdParamDto), upskillController.getCourseById);

// Protected routes
router.use(verifyFirebaseToken);

// User routes
router.post('/courses/recommendations', 
  validateDto(z.object({ skills: z.array(z.string()) })),
  upskillController.getRecommendedCourses
);

// Admin routes
router.post('/courses', 
  requireAdmin,
  validateDto(CreateCourseDto), 
  upskillController.createCourse
);

router.put('/courses/:id', 
  requireAdmin,
  validateParams(IdParamDto),
  validateDto(UpdateCourseDto), 
  upskillController.updateCourse
);

router.delete('/courses/:id', 
  requireAdmin,
  validateParams(IdParamDto),
  upskillController.deleteCourse
);

export default router;
