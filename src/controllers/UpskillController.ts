import type { Request, Response } from 'express';
import { UpskillService } from '../services/UpskillService.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export class UpskillController {
  private upskillService: UpskillService;

  constructor() {
    this.upskillService = new UpskillService();
  }

  createCourse = asyncHandler(async (req: Request, res: Response) => {
    const course = await this.upskillService.createCourse(req.body);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  });

  getCourseById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const course = await this.upskillService.getCourseById(id!);

    res.json({
      success: true,
      message: 'Course retrieved successfully',
      data: course,
    });
  });

  updateCourse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const course = await this.upskillService.updateCourse(id!, req.body);

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  });

  deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.upskillService.deleteCourse(id!);

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  });

  getCourses = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.upskillService.getCourses(req.query as any);

    res.json({
      success: true,
      message: 'Courses retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  });

  getCoursesByProvider = asyncHandler(async (req: Request, res: Response) => {
    const { provider } = req.params;
    const courses = await this.upskillService.getCoursesByProvider(provider as any);

    res.json({
      success: true,
      message: 'Courses by provider retrieved successfully',
      data: courses,
    });
  });

  getCoursesByLevel = asyncHandler(async (req: Request, res: Response) => {
    const { level } = req.params;
    const courses = await this.upskillService.getCoursesByLevel(level as any);

    res.json({
      success: true,
      message: 'Courses by level retrieved successfully',
      data: courses,
    });
  });

  getFreeCourses = asyncHandler(async (req: Request, res: Response) => {
    const courses = await this.upskillService.getFreeCourses();

    res.json({
      success: true,
      message: 'Free courses retrieved successfully',
      data: courses,
    });
  });

  searchCourses = asyncHandler(async (req: Request, res: Response) => {
    const { query } = req.query;
    const courses = await this.upskillService.searchCourses(query as string);

    res.json({
      success: true,
      message: 'Course search completed successfully',
      data: courses,
    });
  });

  getCourseStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.upskillService.getCourseStats();

    res.json({
      success: true,
      message: 'Course stats retrieved successfully',
      data: stats,
    });
  });

  getRecommendedCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { skills } = req.body;
    const { limit } = req.query;

    const courses = await this.upskillService.getRecommendedCourses(
      skills,
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      success: true,
      message: 'Recommended courses retrieved successfully',
      data: courses,
    });
  });
}
