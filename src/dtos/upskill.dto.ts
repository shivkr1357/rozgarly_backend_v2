import { z } from 'zod';
import { IdParamDto } from './common.dto.js';
import { CourseProvider, CourseLevel } from '../models/Course.js';

export const CreateCourseDto = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  provider: z.nativeEnum(CourseProvider).default(CourseProvider.OTHER),
  url: z.string().url(),
  duration: z.number().int().positive().optional(), // in minutes
  level: z.nativeEnum(CourseLevel).default(CourseLevel.BEGINNER),
  tags: z.array(z.string()).default([]),
  thumbnailUrl: z.string().url().optional(),
  instructor: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  isFree: z.boolean().default(false),
});

export const UpdateCourseDto = CreateCourseDto.partial();

export const GetCoursesDto = z.object({
  provider: z.nativeEnum(CourseProvider).optional(),
  level: z.nativeEnum(CourseLevel).optional(),
  tags: z.array(z.string()).optional(),
  isFree: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateCourseDtoType = z.infer<typeof CreateCourseDto>;
export type UpdateCourseDtoType = z.infer<typeof UpdateCourseDto>;
export type GetCoursesDtoType = z.infer<typeof GetCoursesDto>;

// Re-export IdParamDto
export { IdParamDto };
