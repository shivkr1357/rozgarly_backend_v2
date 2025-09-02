import { GetRepository } from 'fireorm';
import { BaseRepository } from './BaseRepository.js';
import { Referral, ReferralStatus } from '../models/Referral.js';

export class ReferralRepository extends BaseRepository<Referral> {
  constructor() {
    super(GetRepository(Referral));
  }

  async findByReferrerUid(referrerUid: string): Promise<Referral[]> {
    return this.findWhere('referrerUid', referrerUid);
  }

  async findByJobId(jobId: string): Promise<Referral[]> {
    return this.findWhere('jobId', jobId);
  }

  async findByReferredEmail(referredEmail: string): Promise<Referral[]> {
    return this.findWhere('referredEmail', referredEmail);
  }

  async findByStatus(status: ReferralStatus): Promise<Referral[]> {
    return this.findWhere('status', status);
  }

  async updateStatus(
    id: string,
    status: ReferralStatus,
    pointsAwarded?: number
  ): Promise<Referral | null> {
    try {
      const updateData: Partial<Referral> = {
        status,
        updatedAt: new Date(),
      };

      if (pointsAwarded !== undefined) {
        updateData.pointsAwarded = pointsAwarded;
      }

      return await this.update(id, updateData);
    } catch (error) {
      console.error(`Error updating referral status for ${id}:`, error);
      return null;
    }
  }

  async getReferralStats(referrerUid: string): Promise<{
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
      const referrals = await this.findByReferrerUid(referrerUid);

      return {
        total: referrals.length,
        pending: referrals.filter(ref => ref.status === ReferralStatus.PENDING).length,
        contacted: referrals.filter(ref => ref.status === ReferralStatus.CONTACTED).length,
        applied: referrals.filter(ref => ref.status === ReferralStatus.APPLIED).length,
        interviewed: referrals.filter(ref => ref.status === ReferralStatus.INTERVIEWED).length,
        hired: referrals.filter(ref => ref.status === ReferralStatus.HIRED).length,
        rejected: referrals.filter(ref => ref.status === ReferralStatus.REJECTED).length,
        totalPoints: referrals.reduce((sum, ref) => sum + ref.pointsAwarded, 0),
      };
    } catch (error) {
      console.error(`Error getting referral stats for user ${referrerUid}:`, error);
      return {
        total: 0,
        pending: 0,
        contacted: 0,
        applied: 0,
        interviewed: 0,
        hired: 0,
        rejected: 0,
        totalPoints: 0,
      };
    }
  }
}
