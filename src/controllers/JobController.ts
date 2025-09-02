import type { Request, Response } from 'express';
import { JobService } from '../services/JobService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  createJob = asyncHandler(async (req: Request, res: Response) => {
    const job = await this.jobService.createJob(req.body);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  });

  getJobById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const job = await this.jobService.getJobById(id!);

    res.json({
      success: true,
      message: 'Job retrieved successfully',
      data: job,
    });
  });

  updateJob = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const job = await this.jobService.updateJob(id!, req.body);

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  });

  deleteJob = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.jobService.deleteJob(id!);

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  });

  searchJobs = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.jobService.searchJobs(req.query as any);

    res.json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  });

  getNearbyJobs = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.jobService.getNearbyJobs(req.query as any);

    res.json({
      success: true,
      message: 'Nearby jobs retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  });

  matchJobs = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.jobService.matchJobs(req.body);

    res.json({
      success: true,
      message: 'Job matches retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  });

  getJobsByCompany = asyncHandler(async (req: Request, res: Response) => {
    const { company } = req.params;
    const jobs = await this.jobService.getJobsByCompany(company!);

    res.json({
      success: true,
      message: 'Jobs by company retrieved successfully',
      data: jobs,
    });
  });

  getJobStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.jobService.getJobStats();

    res.json({
      success: true,
      message: 'Job stats retrieved successfully',
      data: stats,
    });
  });
}
