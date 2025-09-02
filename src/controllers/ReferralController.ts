import type { Request, Response } from 'express';
import { ReferralService } from '../services/ReferralService.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export class ReferralController {
  private referralService: ReferralService;

  constructor() {
    this.referralService = new ReferralService();
  }

  createReferral = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const referral = await this.referralService.createReferral(req.user!.uid, req.body);

    res.status(201).json({
      success: true,
      message: 'Referral created successfully',
      data: referral,
    });
  });

  getReferralById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const referral = await this.referralService.getReferralById(id!);

    res.json({
      success: true,
      message: 'Referral retrieved successfully',
      data: referral,
    });
  });

  updateReferral = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const referral = await this.referralService.updateReferral(id!, req.body);

    res.json({
      success: true,
      message: 'Referral updated successfully',
      data: referral,
    });
  });

  deleteReferral = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.referralService.deleteReferral(id!);

    res.json({
      success: true,
      message: 'Referral deleted successfully',
    });
  });

  getUserReferrals = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await this.referralService.getUserReferrals(req.user!.uid, req.query as any);

    res.json({
      success: true,
      message: 'User referrals retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  });

  getJobReferrals = asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const referrals = await this.referralService.getJobReferrals(jobId!);

    res.json({
      success: true,
      message: 'Job referrals retrieved successfully',
      data: referrals,
    });
  });

  updateReferralStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, pointsAwarded } = req.body;

    const referral = await this.referralService.updateReferralStatus(id!, status, pointsAwarded);

    res.json({
      success: true,
      message: 'Referral status updated successfully',
      data: referral,
    });
  });

  getReferralStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await this.referralService.getReferralStats(req.user!.uid);

    res.json({
      success: true,
      message: 'Referral stats retrieved successfully',
      data: stats,
    });
  });

  getReferralsByEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    const referrals = await this.referralService.getReferralsByEmail(email!);

    res.json({
      success: true,
      message: 'Referrals by email retrieved successfully',
      data: referrals,
    });
  });

  simulateReferralSuccess = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const referral = await this.referralService.simulateReferralSuccess(id!);

    res.json({
      success: true,
      message: 'Referral success simulated successfully',
      data: referral,
    });
  });
}
