import { ReferralRepository } from '../repositories/ReferralRepository.js';
import { JobRepository } from '../repositories/JobRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import type {
  CreateReferralDtoType,
  UpdateReferralDtoType,
  GetReferralsDtoType,
} from '../dtos/referral.dto.js';
import { Referral, ReferralStatus } from '../models/Referral.js';
import { createError } from '../middlewares/errorHandler.js';
import { createPaginationResponse } from '../utils/pagination.js';
import type { PaginationResult } from '../utils/pagination.js';

export class ReferralService {
  private referralRepository: ReferralRepository;
  private jobRepository: JobRepository;
  private userRepository: UserRepository;

  constructor() {
    this.referralRepository = new ReferralRepository();
    this.jobRepository = new JobRepository();
    this.userRepository = new UserRepository();
  }

  async createReferral(
    referrerUid: string,
    referralData: CreateReferralDtoType
  ): Promise<Referral> {
    try {
      // Check if job exists
      const job = await this.jobRepository.findById(referralData.jobId);
      if (!job || !job.isActive) {
        throw createError('Job not found', 404);
      }

      // Check if referrer exists
      const referrer = await this.userRepository.findByUid(referrerUid);
      if (!referrer) {
        throw createError('Referrer not found', 404);
      }

      // Check if referrer already referred this email for this job
      const existingReferrals = await this.referralRepository.findByReferrerUid(referrerUid);
      const duplicateReferral = existingReferrals.find(
        ref => ref.jobId === referralData.jobId && ref.referredEmail === referralData.referredEmail
      );

      if (duplicateReferral) {
        throw createError('You have already referred this email for this job', 409);
      }

      const referralDataToCreate: Partial<Referral> = {
        referrerUid,
        jobId: referralData.jobId,
        referredEmail: referralData.referredEmail,
        status: ReferralStatus.PENDING,
        pointsAwarded: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (referralData.referredName) {
        referralDataToCreate.referredName = referralData.referredName;
      }
      if (referralData.referredPhone) {
        referralDataToCreate.referredPhone = referralData.referredPhone;
      }
      if (referralData.message) {
        referralDataToCreate.message = referralData.message;
      }

      const referral = await this.referralRepository.create(referralDataToCreate);

      return referral;
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  }

  async getReferralById(id: string): Promise<Referral | null> {
    try {
      const referral = await this.referralRepository.findById(id);
      if (!referral) {
        throw createError('Referral not found', 404);
      }
      return referral;
    } catch (error) {
      console.error('Error getting referral by ID:', error);
      throw error;
    }
  }

  async updateReferral(id: string, referralData: UpdateReferralDtoType): Promise<Referral | null> {
    try {
      const referral = await this.referralRepository.findById(id);
      if (!referral) {
        throw createError('Referral not found', 404);
      }

      const updateData: Partial<Referral> = {
        updatedAt: new Date(),
      };

      if (referralData.status) {
        updateData.status = referralData.status;
      }

      if (referralData.pointsAwarded !== undefined) {
        updateData.pointsAwarded = referralData.pointsAwarded;
      }

      const updatedReferral = await this.referralRepository.update(id, updateData);

      // Award points to referrer if status changed to hired
      if (referralData.status === ReferralStatus.HIRED && referralData.pointsAwarded) {
        await this.awardReferralPoints(referral.referrerUid, referralData.pointsAwarded);
      }

      return updatedReferral;
    } catch (error) {
      console.error('Error updating referral:', error);
      throw error;
    }
  }

  async deleteReferral(id: string): Promise<void> {
    try {
      const referral = await this.referralRepository.findById(id);
      if (!referral) {
        throw createError('Referral not found', 404);
      }

      await this.referralRepository.delete(id);
    } catch (error) {
      console.error('Error deleting referral:', error);
      throw error;
    }
  }

  async getUserReferrals(
    userUid: string,
    queryParams: GetReferralsDtoType
  ): Promise<PaginationResult<Referral>> {
    try {
      let referrals = await this.referralRepository.findByReferrerUid(userUid);

      // Filter by status if provided
      if (queryParams.status) {
        referrals = referrals.filter(ref => ref.status === queryParams.status);
      }

      // Sort by created date (newest first)
      referrals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return createPaginationResponse(
        referrals,
        referrals.length,
        queryParams.page,
        queryParams.limit
      );
    } catch (error) {
      console.error('Error getting user referrals:', error);
      throw error;
    }
  }

  async getJobReferrals(jobId: string): Promise<Referral[]> {
    try {
      const job = await this.jobRepository.findById(jobId);
      if (!job) {
        throw createError('Job not found', 404);
      }

      const referrals = await this.referralRepository.findByJobId(jobId);

      // Sort by created date (newest first)
      referrals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return referrals;
    } catch (error) {
      console.error('Error getting job referrals:', error);
      throw error;
    }
  }

  async updateReferralStatus(
    id: string,
    status: ReferralStatus,
    pointsAwarded?: number
  ): Promise<Referral | null> {
    try {
      const referral = await this.referralRepository.findById(id);
      if (!referral) {
        throw createError('Referral not found', 404);
      }

      const updatedReferral = await this.referralRepository.updateStatus(id, status, pointsAwarded);

      // Award points to referrer if status changed to hired
      if (status === ReferralStatus.HIRED && pointsAwarded) {
        await this.awardReferralPoints(referral.referrerUid, pointsAwarded);
      }

      return updatedReferral;
    } catch (error) {
      console.error('Error updating referral status:', error);
      throw error;
    }
  }

  async getReferralStats(userUid: string): Promise<{
    total: number;
    pending: number;
    contacted: number;
    applied: number;
    interviewed: number;
    hired: number;
    rejected: number;
    totalPoints: number;
  }> {
    try {
      return await this.referralRepository.getReferralStats(userUid);
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw error;
    }
  }

  async getReferralsByEmail(email: string): Promise<Referral[]> {
    try {
      const referrals = await this.referralRepository.findByReferredEmail(email);

      // Sort by created date (newest first)
      referrals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return referrals;
    } catch (error) {
      console.error('Error getting referrals by email:', error);
      throw error;
    }
  }

  async simulateReferralSuccess(referralId: string): Promise<Referral | null> {
    try {
      const referral = await this.referralRepository.findById(referralId);
      if (!referral) {
        throw createError('Referral not found', 404);
      }

      if (referral.status !== ReferralStatus.PENDING) {
        throw createError('Referral is not in pending status', 400);
      }

      // Simulate the referral process
      const pointsAwarded = 100; // Points for successful referral
      const updatedReferral = await this.referralRepository.updateStatus(
        referralId,
        ReferralStatus.HIRED,
        pointsAwarded
      );

      // Award points to referrer
      await this.awardReferralPoints(referral.referrerUid, pointsAwarded);

      return updatedReferral;
    } catch (error) {
      console.error('Error simulating referral success:', error);
      throw error;
    }
  }

  private async awardReferralPoints(userUid: string, points: number): Promise<void> {
    try {
      await this.userRepository.updatePoints(userUid, points);
    } catch (error) {
      console.error('Error awarding referral points:', error);
    }
  }
}
