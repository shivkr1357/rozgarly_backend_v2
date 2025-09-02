#!/usr/bin/env tsx

import { initializeFirebase } from '../config/firebase.js';
import { logger } from '../middlewares/logger.js';

// Initialize Firebase FIRST before importing any models
initializeFirebase();

// Import Firebase Admin SDK directly
import admin from 'firebase-admin';

class SimpleSeedService {
  private db: admin.firestore.Firestore;

  constructor() {
    this.db = admin.firestore();
  }

  async seedUsers(): Promise<void> {
    logger.info('Seeding users...');

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
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await this.db
          .collection('users')
          .where('uid', '==', userData.uid)
          .get();

        if (existingUser.empty) {
          await this.db.collection('users').add(userData);
          logger.info(`✅ Created user: ${userData.name}`);
        } else {
          logger.info(`⏭️  User already exists: ${userData.name}`);
        }
      } catch (error) {
        logger.error(`❌ Error creating user ${userData.name}:`, error);
      }
    }
  }

  async seedJobs(): Promise<void> {
    logger.info('Seeding jobs...');

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
        requirements: [
          '5+ years experience',
          'Strong JavaScript skills',
          'React/Node.js experience',
        ],
        benefits: ['Health insurance', 'Flexible hours', 'Remote work'],
        source: 'manual',
        isActive: true,
        postedAt: new Date(),
        updatedAt: new Date(),
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
        description: 'Join our data science team as a Python developer...',
        requirements: [
          '3+ years Python experience',
          'Django framework knowledge',
          'Database experience',
        ],
        benefits: ['Learning budget', 'Team events', 'Stock options'],
        source: 'manual',
        isActive: true,
        postedAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'React Developer (Contract)',
        company: 'StartupXYZ',
        city: 'Delhi',
        district: 'New Delhi',
        locationText: 'New Delhi, Delhi',
        salaryMin: 400000,
        salaryMax: 600000,
        currency: 'INR',
        type: 'contract',
        skills: ['react', 'javascript', 'css', 'html'],
        description: 'Contract position for React developer...',
        requirements: ['2+ years React experience', 'JavaScript proficiency', 'CSS/HTML skills'],
        benefits: ['Flexible schedule', 'Project-based work'],
        source: 'manual',
        isActive: true,
        postedAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const jobData of jobs) {
      try {
        // Check if job already exists
        const existingJob = await this.db
          .collection('jobs')
          .where('title', '==', jobData.title)
          .where('company', '==', jobData.company)
          .get();

        if (existingJob.empty) {
          await this.db.collection('jobs').add(jobData);
          logger.info(`✅ Created job: ${jobData.title} at ${jobData.company}`);
        } else {
          logger.info(`⏭️  Job already exists: ${jobData.title} at ${jobData.company}`);
        }
      } catch (error) {
        logger.error(`❌ Error creating job ${jobData.title}:`, error);
      }
    }
  }

  async seedCourses(): Promise<void> {
    logger.info('Seeding courses...');

    const courses = [
      {
        title: 'Complete JavaScript Course',
        description: 'Learn JavaScript from basics to advanced concepts',
        provider: 'youtube',
        url: 'https://youtube.com/watch?v=example1',
        level: 'beginner',
        tags: ['javascript', 'programming', 'web-development'],
        isFree: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'React Masterclass',
        description: 'Master React.js with hands-on projects',
        provider: 'udemy',
        url: 'https://udemy.com/course/react-masterclass',
        level: 'intermediate',
        tags: ['react', 'javascript', 'frontend'],
        isFree: false,
        price: 2999,
        currency: 'INR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Python for Data Science',
        description: 'Learn Python for data analysis and machine learning',
        provider: 'coursera',
        url: 'https://coursera.org/learn/python-data-science',
        level: 'advanced',
        tags: ['python', 'data-science', 'machine-learning'],
        isFree: false,
        price: 4999,
        currency: 'INR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const courseData of courses) {
      try {
        // Check if course already exists
        const existingCourse = await this.db
          .collection('courses')
          .where('title', '==', courseData.title)
          .get();

        if (existingCourse.empty) {
          await this.db.collection('courses').add(courseData);
          logger.info(`✅ Created course: ${courseData.title}`);
        } else {
          logger.info(`⏭️  Course already exists: ${courseData.title}`);
        }
      } catch (error) {
        logger.error(`❌ Error creating course ${courseData.title}:`, error);
      }
    }
  }

  async seedBadges(): Promise<void> {
    logger.info('Seeding badges...');

    const badges = [
      {
        name: 'First Application',
        description: 'Applied to your first job',
        tier: 'bronze',
        type: 'achievement',
        points: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Profile Complete',
        description: 'Completed your profile with all required information',
        tier: 'bronze',
        type: 'achievement',
        points: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Referral Master',
        description: 'Successfully referred 5 people',
        tier: 'silver',
        type: 'milestone',
        points: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Job Hunter',
        description: 'Applied to 10 jobs',
        tier: 'silver',
        type: 'milestone',
        points: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Community Helper',
        description: 'Helped 20 people in the community',
        tier: 'gold',
        type: 'special',
        points: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const badgeData of badges) {
      try {
        // Check if badge already exists
        const existingBadge = await this.db
          .collection('badges')
          .where('name', '==', badgeData.name)
          .get();

        if (existingBadge.empty) {
          await this.db.collection('badges').add(badgeData);
          logger.info(`✅ Created badge: ${badgeData.name}`);
        } else {
          logger.info(`⏭️  Badge already exists: ${badgeData.name}`);
        }
      } catch (error) {
        logger.error(`❌ Error creating badge ${badgeData.name}:`, error);
      }
    }
  }

  async seedGroups(): Promise<void> {
    logger.info('Seeding groups...');

    const groups = [
      {
        name: 'JavaScript Developers',
        description: 'A community for JavaScript developers to share knowledge and opportunities',
        type: 'skill-based',
        isPublic: true,
        members: ['admin-uid-123', 'user-uid-789'],
        admins: ['admin-uid-123'],
        tags: ['javascript', 'programming', 'web-development'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Mumbai Tech Community',
        description: 'Local tech community for Mumbai-based professionals',
        type: 'location-based',
        isPublic: true,
        members: ['admin-uid-123', 'employer-uid-456'],
        admins: ['admin-uid-123'],
        tags: ['mumbai', 'tech', 'networking'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Job Seekers Support',
        description: 'Support group for job seekers to share experiences and tips',
        type: 'general',
        isPublic: true,
        members: ['user-uid-789'],
        admins: ['admin-uid-123'],
        tags: ['job-search', 'career', 'support'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const groupData of groups) {
      try {
        // Check if group already exists
        const existingGroup = await this.db
          .collection('groups')
          .where('name', '==', groupData.name)
          .get();

        if (existingGroup.empty) {
          await this.db.collection('groups').add(groupData);
          logger.info(`✅ Created group: ${groupData.name}`);
        } else {
          logger.info(`⏭️  Group already exists: ${groupData.name}`);
        }
      } catch (error) {
        logger.error(`❌ Error creating group ${groupData.name}:`, error);
      }
    }
  }

  async runSeeding(): Promise<void> {
    try {
      logger.info('🌱 Starting simple data seeding...');

      await this.seedUsers();
      await this.seedJobs();
      await this.seedCourses();
      await this.seedBadges();
      await this.seedGroups();

      logger.info('✅ Simple data seeding completed successfully!');
    } catch (error) {
      logger.error('❌ Error during simple data seeding:', error);
      throw error;
    }
  }
}

// Run seeding
const seedService = new SimpleSeedService();

seedService
  .runSeeding()
  .then(() => {
    logger.info('🎉 Simple seeding script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    logger.error('💥 Simple seeding script failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  });

export { SimpleSeedService };
