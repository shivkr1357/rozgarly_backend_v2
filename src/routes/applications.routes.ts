import { Router } from 'express';
import { ApplicationController } from '../controllers/ApplicationController.js';
import { verifyFirebaseToken, requireEmployer } from '../middlewares/auth.js';
import { validateDto, validateQuery, validateParams } from '../middlewares/validateDto.js';
import { CreateApplicationDto, UpdateApplicationDto, GetApplicationsDto, IdParamDto } from '../dtos/application.dto.js';
import { ApplicationStatus } from '../models/Application.js';
import { z } from 'zod';

const router = Router();
const applicationController = new ApplicationController();

// All routes require authentication
router.use(verifyFirebaseToken);

// User routes
router.post('/', validateDto(CreateApplicationDto), applicationController.createApplication);
router.get('/my-applications', validateQuery(GetApplicationsDto), applicationController.getUserApplications);
router.get('/my-applications/stats', applicationController.getApplicationStats);
router.put('/:id/withdraw', validateParams(IdParamDto), applicationController.withdrawApplication);

// Employer routes
router.get('/job/:jobId', validateParams(z.object({ jobId: z.string() })), applicationController.getJobApplications);
router.put('/:id/status', 
  requireEmployer,
  validateParams(IdParamDto),
  validateDto(z.object({ 
    status: z.nativeEnum(ApplicationStatus),
    employerNotes: z.string().optional(),
    interviewDate: z.string().datetime().optional()
  })),
  applicationController.updateApplicationStatus
);

// General routes
router.get('/:id', validateParams(IdParamDto), applicationController.getApplicationById);
router.put('/:id', validateParams(IdParamDto), validateDto(UpdateApplicationDto), applicationController.updateApplication);
router.delete('/:id', validateParams(IdParamDto), applicationController.deleteApplication);

export default router;
