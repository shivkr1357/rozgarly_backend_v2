import { Collection } from 'fireorm';

export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance',
}

export enum JobSource {
  ADZUNA = 'adzuna',
  JOOBLE = 'jooble',
  MANUAL = 'manual',
  SCRAPER = 'scraper',
}

@Collection('jobs')
export class Job {
  id!: string;
  title!: string;
  company!: string;
  logoUrl?: string;
  city!: string;
  district!: string;
  locationText!: string;
  latitude?: number;
  longitude?: number;
  salaryMin?: number;
  salaryMax?: number;
  currency: string = 'USD';
  type: JobType = JobType.FULL_TIME;
  skills: string[] = [];
  description?: string;
  requirements?: string[];
  benefits?: string[];
  source: JobSource = JobSource.MANUAL;
  externalUrl?: string;
  fingerprint?: string; // For deduplication
  isActive: boolean = true;
  postedAt: Date = new Date();
  updatedAt: Date = new Date();

  // Subcollections are handled separately to avoid circular dependencies
  // applications?: Application[];
  // referrals?: Referral[];
}
