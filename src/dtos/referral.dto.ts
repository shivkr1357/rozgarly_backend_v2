import { z } from 'zod';
import { IdParamDto } from './common.dto.js';
import { ReferralStatus } from '../models/Referral.js';

export const CreateReferralDto = z.object({
  jobId: z.string().min(1),
  referredEmail: z.string().email(),
  referredName: z.string().optional(),
  referredPhone: z.string().optional(),
  message: z.string().optional(),
});

export const UpdateReferralDto = z.object({
  status: z.nativeEnum(ReferralStatus).optional(),
  pointsAwarded: z.number().int().min(0).optional(),
});

export const GetReferralsDto = z.object({
  status: z.nativeEnum(ReferralStatus).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateReferralDtoType = z.infer<typeof CreateReferralDto>;
export type UpdateReferralDtoType = z.infer<typeof UpdateReferralDto>;
export type GetReferralsDtoType = z.infer<typeof GetReferralsDto>;

// Re-export IdParamDto
export { IdParamDto };
