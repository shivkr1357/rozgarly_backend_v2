#!/usr/bin/env tsx

import { initializeFirebase } from '../config/firebase.js';
import { logger } from '../middlewares/logger.js';

// Initialize Firebase FIRST before importing any models
initializeFirebase();

// Use string literals instead of enums to avoid triggering model loading

class SeedDataService {
  private async getUserRepository() {
    const { UserRepository } = await import('../repositories/UserRepository.js');
    return new UserRepository();
  }

  private async getJobRepository() {
    const { JobRepository } = await import('../repositories/JobRepository.js');
    return new JobRepository();
  }

  private async getCourseRepository() {
    const { CourseRepository } = await import('../repositories/CourseRepository.js');
    return new CourseRepository();
  }

  private async getBadgeRepository() {
    const { BadgeRepository } = await import('../repositories/BadgeRepository.js');
    return new BadgeRepository();
  }

  private async getGroupRepository() {
    const { GroupRepository } = await import('../repositories/GroupRepository.js');
    return new GroupRepository();
  }

  async seedUsers(): Promise<void> {
    logger.info('Seeding users...');
    const userRepository = await this.getUserRepository();
    const { UserRole } = await import('../models/User.js');

    const users = [
      {
        uid: 'admin-uid-123',
        email: 'admin@rozgarly.com',
        name: 'Admin User',
        role: 'admin',
        city: 'Mumbai',
        district: 'Mumbai',
        skills: ['javascript', 'typescript', 'node.js', 'react'],
        points: 1000,
      },
      {
        uid: 'employer-uid-456',
        email: 'employer@techcorp.com',
        name: 'Tech Corp HR',
        role: 'employer',
        city: 'Bangalore',
        district: 'Bangalore',
        skills: ['recruitment', 'hr', 'management'],
        points: 500,
      },
      {
        uid: 'user-uid-789',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'user',
        city: 'Delhi',
        district: 'New Delhi',
        skills: ['python', 'django', 'postgresql', 'aws'],
        points: 250,
      },
    ];

    for (const userData of users) {
      try {
        const existingUser = await userRepository.findByUid(userData.uid);
        if (!existingUser) {
          await userRepository.create({
            ...userData,
            role:
              userData.role === 'admin'
                ? UserRole.ADMIN
                : userData.role === 'employer'
                  ? UserRole.EMPLOYER
                  : UserRole.USER,
            isActive: true,
            badges: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          logger.info(`Created user: ${userData.name}`);
        } else {
          logger.info(`User already exists: ${userData.name}`);
        }
      } catch (error) {
        logger.error(`Error creating user ${userData.name}:`, error);
      }
    }
  }

  async seedJobs(): Promise<void> {
    logger.info('Seeding jobs...');
    const jobRepository = await this.getJobRepository();
    const { JobType, JobSource } = await import('../models/Job.js');

    const jobs = [
      {
        title: 'Senior Full Stack Developer',
        company: 'TechCorp India',
        city: 'Mumbai',
        district: 'Mumbai',
        locationText: 'Mumbai, Maharashtra',
        salaryMin: 800000,
        salaryMax: 1200000,
        currency: 'INR',
        type: 'full-time',
        skills: ['javascript', 'typescript', 'react', 'node.js', 'mongodb'],
        description: 'We are looking for a senior full stack developer to join our team...',
        source: 'manual',
        isActive: true,
      },
      {
        title: 'Python Developer',
        company: 'DataTech Solutions',
        city: 'Bangalore',
        district: 'Bangalore',
        locationText: 'Bangalore, Karnataka',
        salaryMin: 600000,
        salaryMax: 900000,
        currency: 'INR',
        type: 'full-time',
        skills: ['python', 'django', 'postgresql', 'aws'],
        description: 'Join our data engineering team as a Python developer...',
        source: 'manual',
        isActive: true,
      },
      {
        title: 'React Native Developer',
        company: 'MobileFirst Inc',
        city: 'Delhi',
        district: 'New Delhi',
        locationText: 'New Delhi, Delhi',
        salaryMin: 500000,
        salaryMax: 800000,
        currency: 'INR',
        type: 'contract',
        skills: ['react native', 'javascript', 'mobile development'],
        description: 'We need a React Native developer for our mobile app project...',
        source: 'manual',
        isActive: true,
      },
    ];

    for (const jobData of jobs) {
      try {
        await jobRepository.create({
          ...jobData,
          type:
            jobData.type === 'full-time'
              ? JobType.FULL_TIME
              : jobData.type === 'part-time'
                ? JobType.PART_TIME
                : jobData.type === 'contract'
                  ? JobType.CONTRACT
                  : JobType.INTERNSHIP,
          source: JobSource.MANUAL,
          postedAt: new Date(),
          updatedAt: new Date(),
        });
        logger.info(`Created job: ${jobData.title}`);
      } catch (error) {
        logger.error(`Error creating job ${jobData.title}:`, error);
      }
    }
  }

  async seedCourses(): Promise<void> {
    logger.info('Seeding courses...');
    const courseRepository = await this.getCourseRepository();
    const { CourseProvider, CourseLevel } = await import('../models/Course.js');

    const courses = [
      {
        title: 'Complete JavaScript Course',
        description: 'Learn JavaScript from basics to advanced concepts',
        provider: 'youtube',
        url: 'https://youtube.com/watch?v=example1',
        duration: 1200, // 20 hours
        level: 'beginner',
        tags: ['javascript', 'programming', 'web development'],
        isFree: true,
        rating: 4.5,
      },
      {
        title: 'React Masterclass',
        description: 'Master React.js with hands-on projects',
        provider: 'udemy',
        url: 'https://udemy.com/react-masterclass',
        duration: 1800, // 30 hours
        level: 'intermediate',
        tags: ['react', 'javascript', 'frontend'],
        isFree: false,
        price: 2999,
        currency: 'INR',
        rating: 4.8,
      },
      {
        title: 'Python for Data Science',
        description: 'Learn Python programming for data analysis and machine learning',
        provider: 'coursera',
        url: 'https://coursera.org/python-data-science',
        duration: 2400, // 40 hours
        level: 'advanced',
        tags: ['python', 'data science', 'machine learning'],
        isFree: false,
        price: 4999,
        currency: 'INR',
        rating: 4.7,
      },
    ];

    for (const courseData of courses) {
      try {
        await courseRepository.create({
          ...courseData,
          provider:
            courseData.provider === 'coursera'
              ? CourseProvider.COURSERA
              : courseData.provider === 'udemy'
                ? CourseProvider.UDEMY
                : courseData.provider === 'youtube'
                  ? CourseProvider.YOUTUBE
                  : CourseProvider.OTHER,
          level:
            courseData.level === 'beginner'
              ? CourseLevel.BEGINNER
              : courseData.level === 'intermediate'
                ? CourseLevel.INTERMEDIATE
                : CourseLevel.ADVANCED,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        logger.info(`Created course: ${courseData.title}`);
      } catch (error) {
        logger.error(`Error creating course ${courseData.title}:`, error);
      }
    }
  }

  async seedBadges(): Promise<void> {
    logger.info('Seeding badges...');
    const badgeRepository = await this.getBadgeRepository();
    const { BadgeTier, BadgeType } = await import('../models/Badge.js');

    const badges = [
      {
        name: 'First Application',
        description: 'Applied to your first job',
        tier: 'bronze',
        type: 'achievement',
        points: 10,
      },
      {
        name: 'Profile Complete',
        description: 'Completed your profile with all required information',
        tier: 'bronze',
        type: 'achievement',
        points: 25,
      },
      {
        name: 'Referral Master',
        description: 'Successfully referred 5 people',
        tier: 'silver',
        type: 'milestone',
        points: 100,
      },
      {
        name: 'Job Hunter',
        description: 'Applied to 10 jobs',
        tier: 'silver',
        type: 'milestone',
        points: 50,
      },
      {
        name: 'Community Helper',
        description: 'Active member of the community',
        tier: 'gold',
        type: 'special',
        points: 200,
      },
    ];

    for (const badgeData of badges) {
      try {
        await badgeRepository.create({
          ...badgeData,
          tier:
            badgeData.tier === 'bronze'
              ? BadgeTier.BRONZE
              : badgeData.tier === 'silver'
                ? BadgeTier.SILVER
                : badgeData.tier === 'gold'
                  ? BadgeTier.GOLD
                  : BadgeTier.PLATINUM,
          type:
            badgeData.type === 'achievement'
              ? BadgeType.ACHIEVEMENT
              : badgeData.type === 'milestone'
                ? BadgeType.MILESTONE
                : BadgeType.SPECIAL,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        logger.info(`Created badge: ${badgeData.name}`);
      } catch (error) {
        logger.error(`Error creating badge ${badgeData.name}:`, error);
      }
    }
  }

  async seedGroups(): Promise<void> {
    logger.info('Seeding groups...');
    const groupRepository = await this.getGroupRepository();
    const { GroupType } = await import('../models/Group.js');

    const groups = [
      {
        name: 'JavaScript Developers',
        description: 'A community for JavaScript developers to share knowledge and opportunities',
        type: 'skill-based',
        isPublic: true,
        tags: ['javascript', 'programming', 'web development'],
        members: ['user-uid-789'],
        admins: ['admin-uid-123'],
      },
      {
        name: 'Mumbai Tech Community',
        description: 'Local tech community for Mumbai-based professionals',
        type: 'location-based',
        isPublic: true,
        tags: ['mumbai', 'tech', 'networking'],
        members: ['admin-uid-123', 'employer-uid-456'],
        admins: ['admin-uid-123'],
      },
      {
        name: 'Job Seekers Support',
        description: 'Support group for job seekers to share experiences and tips',
        type: 'general',
        isPublic: true,
        tags: ['job search', 'career', 'support'],
        members: ['user-uid-789'],
        admins: ['admin-uid-123'],
      },
    ];

    for (const groupData of groups) {
      try {
        await groupRepository.create({
          ...groupData,
          type:
            groupData.type === 'public'
              ? GroupType.GENERAL
              : groupData.type === 'skill-based'
                ? GroupType.SKILL_BASED
                : groupData.type === 'location-based'
                  ? GroupType.LOCATION_BASED
                  : GroupType.COMPANY_BASED,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        logger.info(`Created group: ${groupData.name}`);
      } catch (error) {
        logger.error(`Error creating group ${groupData.name}:`, error);
      }
    }
  }

  async runSeeding(): Promise<void> {
    logger.info('Starting data seeding process...');

    try {
      await this.seedUsers();
      await this.seedJobs();
      await this.seedCourses();
      await this.seedBadges();
      await this.seedGroups();

      logger.info('Data seeding completed successfully!');
    } catch (error) {
      logger.error('Error during data seeding:', error);
      throw error;
    }
  }
}

// Run seeding
const seedService = new SeedDataService();

seedService
  .runSeeding()
  .then(() => {
    logger.info('Seeding script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    logger.error('Seeding script failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  });

export { SeedDataService };
