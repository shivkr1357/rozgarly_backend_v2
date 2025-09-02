import { Collection } from 'fireorm';

export enum ReferralStatus {
  PENDING = 'pending',
  CONTACTED = 'contacted',
  APPLIED = 'applied',
  INTERVIEWED = 'interviewed',
  HIRED = 'hired',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Collection('referrals')
export class Referral {
  id!: string;
  referrerUid!: string;
  jobId!: string;
  referredEmail!: string;
  referredName?: string;
  referredPhone?: string;
  status: ReferralStatus = ReferralStatus.PENDING;
  message?: string;
  pointsAwarded: number = 0;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}
