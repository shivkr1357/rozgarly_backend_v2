import { z } from 'zod';
import { IdParamDto } from './common.dto.js';

export const CreateUserDto = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  photoURL: z.string().url().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  skills: z.array(z.string()).default([]),
});

export const UpdateUserDto = z.object({
  name: z.string().min(1).optional(),
  photoURL: z.string().url().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const LoginDto = z.object({
  idToken: z.string().min(1),
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
export type LoginDtoType = z.infer<typeof LoginDto>;

// Re-export IdParamDto
export { IdParamDto };
