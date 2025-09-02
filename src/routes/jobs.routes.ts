import { Router } from 'express';
import { JobController } from '../controllers/JobController.js';
import { verifyFirebaseToken, requireAdmin } from '../middlewares/auth.js';
import { validateDto, validateQuery, validateParams } from '../middlewares/validateDto.js';
import {
  CreateJobDto,
  UpdateJobDto,
  SearchJobsDto,
  GetNearbyJobsDto,
  MatchJobsDto,
  IdParamDto,
} from '../dtos/job.dto.js';

const router = Router();
const jobController = new JobController();

// Public routes
router.get('/search', validateQuery(SearchJobsDto), jobController.searchJobs);
router.get('/nearby', validateQuery(GetNearbyJobsDto), jobController.getNearbyJobs);
router.post('/match', validateDto(MatchJobsDto), jobController.matchJobs);
router.get('/stats', jobController.getJobStats);
router.get('/company/:company', jobController.getJobsByCompany);
router.get('/:id', validateParams(IdParamDto), jobController.getJobById);

// Protected routes (require authentication)
router.use(verifyFirebaseToken);

// Authenticated user routes (anyone can create/update jobs)
router.post('/', validateDto(CreateJobDto), jobController.createJob);

router.put('/:id', validateParams(IdParamDto), validateDto(UpdateJobDto), jobController.updateJob);

router.delete('/:id', requireAdmin, validateParams(IdParamDto), jobController.deleteJob);

export default router;
