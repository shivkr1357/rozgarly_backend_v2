import { z } from 'zod';
import { IdParamDto } from './common.dto.js';
import { JobType, JobSource } from '../models/Job.js';

export const CreateJobDto = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  logoUrl: z.string().url().optional(),
  city: z.string().min(1),
  district: z.string().min(1),
  locationText: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().default('USD'),
  type: z.nativeEnum(JobType).default(JobType.FULL_TIME),
  skills: z.array(z.string()).default([]),
  description: z.string().optional(),
  requirements: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  source: z.nativeEnum(JobSource).default(JobSource.MANUAL),
  externalUrl: z.string().url().optional(),
});

export const UpdateJobDto = CreateJobDto.partial();

export const SearchJobsDto = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  type: z.nativeEnum(JobType).optional(),
  skills: z.array(z.string()).optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const GetNearbyJobsDto = z.object({
  latitude: z.number(),
  longitude: z.number(),
  radius: z.number().positive().default(10), // in kilometers
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const MatchJobsDto = z.object({
  skills: z.array(z.string()).min(1),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateJobDtoType = z.infer<typeof CreateJobDto>;
export type UpdateJobDtoType = z.infer<typeof UpdateJobDto>;
export type SearchJobsDtoType = z.infer<typeof SearchJobsDto>;
export type GetNearbyJobsDtoType = z.infer<typeof GetNearbyJobsDto>;
export type MatchJobsDtoType = z.infer<typeof MatchJobsDto>;

// Re-export IdParamDto
export { IdParamDto };
