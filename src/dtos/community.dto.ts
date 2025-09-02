import { z } from 'zod';
import { IdParamDto } from './common.dto.js';
import { GroupType } from '../models/Group.js';

export const CreateGroupDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(GroupType).default(GroupType.GENERAL),
  isPublic: z.boolean().default(true),
  maxMembers: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
});

export const UpdateGroupDto = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  maxMembers: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
});

export const CreateMessageDto = z.object({
  groupId: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['text', 'image', 'file']).default('text'),
  metadata: z.record(z.any()).optional(),
});

export const UpdateMessageDto = z.object({
  content: z.string().min(1).optional(),
});

export const GetGroupsDto = z.object({
  type: z.nativeEnum(GroupType).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const GetMessagesDto = z.object({
  groupId: z.string().min(1),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

export const JoinGroupDto = z.object({
  groupId: z.string().min(1),
});

export const LeaveGroupDto = z.object({
  groupId: z.string().min(1),
});

export const AddReactionDto = z.object({
  messageId: z.string().min(1),
  emoji: z.string().min(1),
});

export const RemoveReactionDto = z.object({
  messageId: z.string().min(1),
  emoji: z.string().min(1),
});

export type CreateGroupDtoType = z.infer<typeof CreateGroupDto>;
export type UpdateGroupDtoType = z.infer<typeof UpdateGroupDto>;
export type CreateMessageDtoType = z.infer<typeof CreateMessageDto>;
export type UpdateMessageDtoType = z.infer<typeof UpdateMessageDto>;
export type GetGroupsDtoType = z.infer<typeof GetGroupsDto>;
export type GetMessagesDtoType = z.infer<typeof GetMessagesDto>;
export type JoinGroupDtoType = z.infer<typeof JoinGroupDto>;
export type LeaveGroupDtoType = z.infer<typeof LeaveGroupDto>;
export type AddReactionDtoType = z.infer<typeof AddReactionDto>;
export type RemoveReactionDtoType = z.infer<typeof RemoveReactionDto>;

// Re-export IdParamDto
export { IdParamDto };
