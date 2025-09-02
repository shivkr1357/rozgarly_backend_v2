import { Router } from 'express';
import { ReferralController } from '../controllers/ReferralController.js';
import { verifyFirebaseToken, requireEmployer } from '../middlewares/auth.js';
import { validateDto, validateQuery, validateParams } from '../middlewares/validateDto.js';
import { CreateReferralDto, UpdateReferralDto, GetReferralsDto, IdParamDto } from '../dtos/referral.dto.js';
import { ReferralStatus } from '../models/Referral.js';
import { z } from 'zod';

const router = Router();
const referralController = new ReferralController();

// All routes require authentication
router.use(verifyFirebaseToken);

// User routes
router.post('/', validateDto(CreateReferralDto), referralController.createReferral);
router.get('/my-referrals', validateQuery(GetReferralsDto), referralController.getUserReferrals);
router.get('/my-referrals/stats', referralController.getReferralStats);

// Employer routes
router.get('/job/:jobId', validateParams(z.object({ jobId: z.string() })), referralController.getJobReferrals);
router.put('/:id/status', 
  requireEmployer,
  validateParams(IdParamDto),
  validateDto(z.object({ 
    status: z.nativeEnum(ReferralStatus),
    pointsAwarded: z.number().int().min(0).optional()
  })),
  referralController.updateReferralStatus
);

// General routes
router.get('/:id', validateParams(IdParamDto), referralController.getReferralById);
router.put('/:id', validateParams(IdParamDto), validateDto(UpdateReferralDto), referralController.updateReferral);
router.delete('/:id', validateParams(IdParamDto), referralController.deleteReferral);
router.get('/email/:email', validateParams(z.object({ email: z.string().email() })), referralController.getReferralsByEmail);

// Admin/Testing routes
router.post('/:id/simulate-success', validateParams(IdParamDto), referralController.simulateReferralSuccess);

export default router;
