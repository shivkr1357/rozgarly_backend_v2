import type { Request, Response } from 'express';
import { ApplicationService } from '../services/ApplicationService.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  createApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const application = await this.applicationService.createApplication(req.user!.uid, req.body);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  });

  getApplicationById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const application = await this.applicationService.getApplicationById(id!);

    res.json({
      success: true,
      message: 'Application retrieved successfully',
      data: application,
    });
  });

  updateApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const application = await this.applicationService.updateApplication(id!, req.body);

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: application,
    });
  });

  deleteApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.applicationService.deleteApplication(id!);

    res.json({
      success: true,
      message: 'Application deleted successfully',
    });
  });

  getUserApplications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await this.applicationService.getUserApplications(
      req.user!.uid,
      req.query as any
    );

    res.json({
      success: true,
      message: 'User applications retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  });

  getJobApplications = asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const applications = await this.applicationService.getJobApplications(jobId!);

    res.json({
      success: true,
      message: 'Job applications retrieved successfully',
      data: applications,
    });
  });

  updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, employerNotes } = req.body;

    const application = await this.applicationService.updateApplicationStatus(
      id!,
      status,
      employerNotes
    );

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
    });
  });

  getApplicationStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await this.applicationService.getApplicationStats(req.user!.uid);

    res.json({
      success: true,
      message: 'Application stats retrieved successfully',
      data: stats,
    });
  });

  withdrawApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const application = await this.applicationService.withdrawApplication(id!, req.user!.uid);

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application,
    });
  });
}
