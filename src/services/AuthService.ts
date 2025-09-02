import { UserRepository } from '../repositories/UserRepository.js';
import type { CreateUserDtoType, UpdateUserDtoType } from '../dtos/auth.dto.js';
import { User, UserRole } from '../models/User.js';
import { createError } from '../middlewares/errorHandler.js';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: CreateUserDtoType): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByUid(userData.uid);
      if (existingUser) {
        throw createError('User already exists', 409);
      }

      // Check if email is already taken
      const existingEmail = await this.userRepository.findByEmail(userData.email);
      if (existingEmail) {
        throw createError('Email already registered', 409);
      }

      const userDataToCreate: Partial<User> = {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        role: UserRole.USER,
        isActive: true,
        points: 0,
        badges: [],
        skills: userData.skills || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (userData.photoURL) {
        userDataToCreate.photoURL = userData.photoURL;
      }
      if (userData.phone) {
        userDataToCreate.phone = userData.phone;
      }
      if (userData.city) {
        userDataToCreate.city = userData.city;
      }
      if (userData.district) {
        userDataToCreate.district = userData.district;
      }

      const user = await this.userRepository.create(userDataToCreate);

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserByUid(uid: string): Promise<User | null> {
    try {
      return await this.userRepository.findByUid(uid);
    } catch (error) {
      console.error('Error getting user by UID:', error);
      throw error;
    }
  }

  async updateUser(uid: string, userData: UpdateUserDtoType): Promise<User | null> {
    try {
      const user = await this.userRepository.findByUid(uid);
      if (!user) {
        throw createError('User not found', 404);
      }

      const userDataToUpdate: Partial<User> = {
        updatedAt: new Date(),
      };

      if (userData.name !== undefined) {
        userDataToUpdate.name = userData.name;
      }
      if (userData.photoURL !== undefined) {
        userDataToUpdate.photoURL = userData.photoURL;
      }
      if (userData.phone !== undefined) {
        userDataToUpdate.phone = userData.phone;
      }
      if (userData.city !== undefined) {
        userDataToUpdate.city = userData.city;
      }
      if (userData.district !== undefined) {
        userDataToUpdate.district = userData.district;
      }
      if (userData.skills !== undefined) {
        userDataToUpdate.skills = userData.skills;
      }

      const updatedUser = await this.userRepository.update(user.id, userDataToUpdate);

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      const user = await this.userRepository.findByUid(uid);
      if (!user) {
        throw createError('User not found', 404);
      }

      await this.userRepository.delete(user.id);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findByUid(uid);
      if (!user) {
        throw createError('User not found', 404);
      }

      return user;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateUserRole(uid: string, role: UserRole): Promise<User | null> {
    try {
      const user = await this.userRepository.findByUid(uid);
      if (!user) {
        throw createError('User not found', 404);
      }

      const updatedUser = await this.userRepository.update(user.id, {
        role,
        updatedAt: new Date(),
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async addUserSkills(uid: string, skills: string[]): Promise<User | null> {
    try {
      const user = await this.userRepository.findByUid(uid);
      if (!user) {
        throw createError('User not found', 404);
      }

      const updatedUser = await this.userRepository.addSkills(uid, skills);
      return updatedUser;
    } catch (error) {
      console.error('Error adding user skills:', error);
      throw error;
    }
  }

  async getUserStats(uid: string): Promise<{
    totalApplications: number;
    totalReferrals: number;
    totalPoints: number;
    badgesCount: number;
    skillsCount: number;
  }> {
    try {
      const user = await this.userRepository.findByUid(uid);
      if (!user) {
        throw createError('User not found', 404);
      }

      // This would typically involve more complex queries
      // For now, returning basic stats from user object
      return {
        totalApplications: 0, // Would be calculated from applications
        totalReferrals: 0, // Would be calculated from referrals
        totalPoints: user.points,
        badgesCount: user.badges.length,
        skillsCount: user.skills.length,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}
