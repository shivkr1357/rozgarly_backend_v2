import { Collection } from 'fireorm';

export enum CourseProvider {
  YOUTUBE = 'youtube',
  UDEMY = 'udemy',
  COURSERA = 'coursera',
  LINKEDIN = 'linkedin',
  INTERNAL = 'internal',
  OTHER = 'other',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Collection('courses')
export class Course {
  id!: string;
  title!: string;
  description?: string;
  provider: CourseProvider = CourseProvider.OTHER;
  url!: string;
  duration?: number; // in minutes
  level: CourseLevel = CourseLevel.BEGINNER;
  tags: string[] = [];
  thumbnailUrl?: string;
  instructor?: string;
  rating?: number;
  price?: number;
  currency: string = 'USD';
  isFree: boolean = false;
  isActive: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}
