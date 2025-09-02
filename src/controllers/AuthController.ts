import type { Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  });

  getUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await this.authService.getUserProfile(req.user!.uid);

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    });
  });

  updateUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await this.authService.updateUser(req.user!.uid, req.body);

    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: user,
    });
  });

  deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await this.authService.deleteUser(req.user!.uid);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  });

  getUserStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await this.authService.getUserStats(req.user!.uid);

    res.json({
      success: true,
      message: 'User stats retrieved successfully',
      data: stats,
    });
  });

  addUserSkills = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { skills } = req.body;
    const user = await this.authService.addUserSkills(req.user!.uid, skills);

    res.json({
      success: true,
      message: 'Skills added successfully',
      data: user,
    });
  });

  // Admin only endpoints
  updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { uid } = req.params;
    const { role } = req.body;

    const user = await this.authService.updateUserRole(uid!, role);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  });
}
