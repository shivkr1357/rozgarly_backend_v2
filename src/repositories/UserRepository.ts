import { GetRepository } from 'fireorm';
import { BaseRepository } from './BaseRepository.js';
import { User } from '../models/User.js';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(GetRepository(User));
  }

  async findByUid(uid: string): Promise<User | null> {
    try {
      const users = await this.findWhere('uid', uid);
      return users.length > 0 ? users[0]! : null;
    } catch (error) {
      console.error(`Error finding user by uid ${uid}:`, error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.findWhere('email', email);
      return users.length > 0 ? users[0]! : null;
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      return null;
    }
  }

  async findByCity(city: string): Promise<User[]> {
    return this.findWhere('city', city);
  }

  async findByDistrict(district: string): Promise<User[]> {
    return this.findWhere('district', district);
  }

  async findBySkills(skills: string[]): Promise<User[]> {
    const users: User[] = [];
    for (const skill of skills) {
      const skillUsers = await this.findWhereArrayContains('skills', skill);
      users.push(...skillUsers);
    }
    // Remove duplicates
    return users.filter((user, index, self) => index === self.findIndex(u => u.id === user.id));
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findWhere('isActive', true);
  }

  async updatePoints(uid: string, points: number): Promise<User | null> {
    try {
      const user = await this.findByUid(uid);
      if (!user) return null;

      return await this.update(user.id, {
        points: user.points + points,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error updating points for user ${uid}:`, error);
      return null;
    }
  }

  async addBadge(uid: string, badgeId: string): Promise<User | null> {
    try {
      const user = await this.findByUid(uid);
      if (!user) return null;

      if (!user.badges.includes(badgeId)) {
        return await this.update(user.id, {
          badges: [...user.badges, badgeId],
          updatedAt: new Date(),
        });
      }
      return user;
    } catch (error) {
      console.error(`Error adding badge to user ${uid}:`, error);
      return null;
    }
  }

  async addSkills(uid: string, skills: string[]): Promise<User | null> {
    try {
      const user = await this.findByUid(uid);
      if (!user) return null;

      const newSkills = [...new Set([...user.skills, ...skills])];
      return await this.update(user.id, {
        skills: newSkills,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error adding skills to user ${uid}:`, error);
      return null;
    }
  }
}
