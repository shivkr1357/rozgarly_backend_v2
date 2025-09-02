import { GetRepository } from 'fireorm';
import { BaseRepository } from './BaseRepository.js';
import { Badge, BadgeTier, BadgeType } from '../models/Badge.js';

export class BadgeRepository extends BaseRepository<Badge> {
  constructor() {
    super(GetRepository(Badge));
  }

  async findByTier(tier: BadgeTier): Promise<Badge[]> {
    return this.findWhere('tier', tier);
  }

  async findByType(type: BadgeType): Promise<Badge[]> {
    return this.findWhere('type', type);
  }

  async findActiveBadges(): Promise<Badge[]> {
    return this.findWhere('isActive', true);
  }

  async findByPointsRange(minPoints: number, maxPoints?: number): Promise<Badge[]> {
    try {
      let query = this.repository.whereEqualTo('isActive', true);

      if (minPoints !== undefined) {
        query = query.whereGreaterOrEqualThan('points', minPoints);
      }

      if (maxPoints !== undefined) {
        query = query.whereLessOrEqualThan('points', maxPoints);
      }

      return await query.find();
    } catch (error) {
      console.error('Error finding badges by points range:', error);
      return [];
    }
  }

  async searchBadges(searchTerm: string): Promise<Badge[]> {
    try {
      const allBadges = await this.findActiveBadges();
      const term = searchTerm.toLowerCase();

      return allBadges.filter(
        badge =>
          badge.name.toLowerCase().includes(term) || badge.description?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching badges:', error);
      return [];
    }
  }
}
