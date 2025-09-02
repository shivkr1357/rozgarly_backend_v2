import { z } from 'zod';

export const PaginationDto = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const IdParamDto = z.object({
  id: z.string().min(1),
});

export const SearchDto = z.object({
  query: z.string().min(1),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type PaginationDtoType = z.infer<typeof PaginationDto>;
export type IdParamDtoType = z.infer<typeof IdParamDto>;
export type SearchDtoType = z.infer<typeof SearchDto>;
