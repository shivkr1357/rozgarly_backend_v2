import { Collection } from 'fireorm';

export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export enum BadgeType {
  ACHIEVEMENT = 'achievement',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
  SEASONAL = 'seasonal',
}

@Collection('badges')
export class Badge {
  id!: string;
  name!: string;
  description?: string;
  iconUrl?: string;
  tier: BadgeTier = BadgeTier.BRONZE;
  type: BadgeType = BadgeType.ACHIEVEMENT;
  points: number = 0;
  requirements?: Record<string, any>;
  isActive: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}
