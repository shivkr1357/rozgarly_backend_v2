import { z } from 'zod';
import { ApplicationStatus } from '../models/Application.js';
import { IdParamDto } from './common.dto.js';

export const CreateApplicationDto = z.object({
  jobId: z.string().min(1),
  resumeUrl: z.string().url().optional(),
  coverNote: z.string().optional(),
});

export const UpdateApplicationDto = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  employerNotes: z.string().optional(),
  interviewDate: z.string().datetime().optional(),
});

export const GetApplicationsDto = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateApplicationDtoType = z.infer<typeof CreateApplicationDto>;
export type UpdateApplicationDtoType = z.infer<typeof UpdateApplicationDto>;
export type GetApplicationsDtoType = z.infer<typeof GetApplicationsDto>;

// Re-export IdParamDto
export { IdParamDto };
