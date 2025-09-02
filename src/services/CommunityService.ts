import { GroupRepository, MessageRepository } from '../repositories/GroupRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import type {
  CreateGroupDtoType,
  UpdateGroupDtoType,
  CreateMessageDtoType,
  UpdateMessageDtoType,
  GetGroupsDtoType,
  GetMessagesDtoType,
} from '../dtos/community.dto.js';
import { Group, Message } from '../models/Group.js';
import { createError } from '../middlewares/errorHandler.js';
import { createPaginationResponse } from '../utils/pagination.js';
import type { PaginationResult } from '../utils/pagination.js';

export class CommunityService {
  private groupRepository: GroupRepository;
  private messageRepository: MessageRepository;
  private userRepository: UserRepository;

  constructor() {
    this.groupRepository = new GroupRepository();
    this.messageRepository = new MessageRepository();
    this.userRepository = new UserRepository();
  }

  async createGroup(creatorUid: string, groupData: CreateGroupDtoType): Promise<Group> {
    try {
      // Check if creator exists
      const creator = await this.userRepository.findByUid(creatorUid);
      if (!creator) {
        throw createError('Creator not found', 404);
      }

      const groupDataToCreate: Partial<Group> = {
        name: groupData.name,
        type: groupData.type,
        isPublic: groupData.isPublic,
        tags: groupData.tags,
        members: [creatorUid],
        admins: [creatorUid],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (groupData.description) {
        groupDataToCreate.description = groupData.description;
      }
      if (groupData.maxMembers) {
        groupDataToCreate.maxMembers = groupData.maxMembers;
      }

      const group = await this.groupRepository.create(groupDataToCreate);

      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async getGroupById(id: string): Promise<Group | null> {
    try {
      const group = await this.groupRepository.findById(id);
      if (!group) {
        throw createError('Group not found', 404);
      }
      return group;
    } catch (error) {
      console.error('Error getting group by ID:', error);
      throw error;
    }
  }

  async updateGroup(
    id: string,
    groupData: UpdateGroupDtoType,
    userUid: string
  ): Promise<Group | null> {
    try {
      const group = await this.groupRepository.findById(id);
      if (!group) {
        throw createError('Group not found', 404);
      }

      // Check if user is admin
      if (!group.admins.includes(userUid)) {
        throw createError('Only admins can update group', 403);
      }

      const groupDataToUpdate: Partial<Group> = {
        updatedAt: new Date(),
      };

      if (groupData.name !== undefined) {
        groupDataToUpdate.name = groupData.name;
      }
      if (groupData.description !== undefined) {
        groupDataToUpdate.description = groupData.description;
      }
      if (groupData.isPublic !== undefined) {
        groupDataToUpdate.isPublic = groupData.isPublic;
      }
      if (groupData.maxMembers !== undefined) {
        groupDataToUpdate.maxMembers = groupData.maxMembers;
      }
      if (groupData.tags !== undefined) {
        groupDataToUpdate.tags = groupData.tags;
      }

      const updatedGroup = await this.groupRepository.update(id, groupDataToUpdate);

      return updatedGroup;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  async deleteGroup(id: string, userUid: string): Promise<void> {
    try {
      const group = await this.groupRepository.findById(id);
      if (!group) {
        throw createError('Group not found', 404);
      }

      // Check if user is admin
      if (!group.admins.includes(userUid)) {
        throw createError('Only admins can delete group', 403);
      }

      await this.groupRepository.delete(id);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  async getGroups(queryParams: GetGroupsDtoType): Promise<PaginationResult<Group>> {
    try {
      let groups: Group[] = [];

      if (queryParams.type) {
        groups = await this.groupRepository.findByType(queryParams.type);
      } else if (queryParams.isPublic !== undefined) {
        if (queryParams.isPublic) {
          groups = await this.groupRepository.findPublicGroups();
        } else {
          // For private groups, you'd need to check user membership
          groups = [];
        }
      } else {
        groups = await this.groupRepository.findPublicGroups();
      }

      // Filter by tags if provided
      if (queryParams.tags && queryParams.tags.length > 0) {
        groups = groups.filter(group => queryParams.tags!.some(tag => group.tags.includes(tag)));
      }

      // Sort by created date (newest first)
      groups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return createPaginationResponse(groups, groups.length, queryParams.page, queryParams.limit);
    } catch (error) {
      console.error('Error getting groups:', error);
      throw error;
    }
  }

  async joinGroup(groupId: string, userUid: string): Promise<Group | null> {
    try {
      const group = await this.groupRepository.findById(groupId);
      if (!group) {
        throw createError('Group not found', 404);
      }

      // Check if group is public or user is invited
      if (!group.isPublic && !group.members.includes(userUid)) {
        throw createError('Group is private and you are not a member', 403);
      }

      // Check if group has reached max members
      if (group.maxMembers && group.members.length >= group.maxMembers) {
        throw createError('Group has reached maximum members', 400);
      }

      const updatedGroup = await this.groupRepository.addMember(groupId, userUid);
      return updatedGroup;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  async leaveGroup(groupId: string, userUid: string): Promise<Group | null> {
    try {
      const group = await this.groupRepository.findById(groupId);
      if (!group) {
        throw createError('Group not found', 404);
      }

      // Check if user is a member
      if (!group.members.includes(userUid)) {
        throw createError('You are not a member of this group', 400);
      }

      // Remove from admins if they are one
      if (group.admins.includes(userUid)) {
        await this.groupRepository.removeAdmin(groupId, userUid);
      }

      const updatedGroup = await this.groupRepository.removeMember(groupId, userUid);
      return updatedGroup;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  async createMessage(userUid: string, messageData: CreateMessageDtoType): Promise<Message> {
    try {
      // Check if group exists
      const group = await this.groupRepository.findById(messageData.groupId);
      if (!group) {
        throw createError('Group not found', 404);
      }

      // Check if user is a member
      if (!group.members.includes(userUid)) {
        throw createError('You are not a member of this group', 403);
      }

      const messageDataToCreate: Partial<Message> = {
        groupId: messageData.groupId,
        senderUid: userUid,
        content: messageData.content,
        type: messageData.type,
        reactions: {},
        isEdited: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (messageData.metadata) {
        messageDataToCreate.metadata = messageData.metadata;
      }

      const message = await this.messageRepository.create(messageDataToCreate);

      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async getMessages(queryParams: GetMessagesDtoType): Promise<PaginationResult<Message>> {
    try {
      // Check if group exists
      const group = await this.groupRepository.findById(queryParams.groupId);
      if (!group) {
        throw createError('Group not found', 404);
      }

      const messages = await this.messageRepository.getRecentMessages(
        queryParams.groupId,
        queryParams.limit
      );

      // Sort by created date (oldest first for chat)
      messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      return createPaginationResponse(
        messages,
        messages.length,
        queryParams.page,
        queryParams.limit
      );
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  async updateMessage(
    messageId: string,
    messageData: UpdateMessageDtoType,
    userUid: string
  ): Promise<Message | null> {
    try {
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        throw createError('Message not found', 404);
      }

      // Check if user is the sender
      if (message.senderUid !== userUid) {
        throw createError('You can only edit your own messages', 403);
      }

      const messageDataToUpdate: Partial<Message> = {
        isEdited: true,
        editedAt: new Date(),
        updatedAt: new Date(),
      };

      if (messageData.content !== undefined) {
        messageDataToUpdate.content = messageData.content;
      }

      const updatedMessage = await this.messageRepository.update(messageId, messageDataToUpdate);

      return updatedMessage;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string, userUid: string): Promise<void> {
    try {
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        throw createError('Message not found', 404);
      }

      // Check if user is the sender or group admin
      const group = await this.groupRepository.findById(message.groupId);
      if (!group) {
        throw createError('Group not found', 404);
      }

      const isSender = message.senderUid === userUid;
      const isAdmin = group.admins.includes(userUid);

      if (!isSender && !isAdmin) {
        throw createError('You can only delete your own messages or be a group admin', 403);
      }

      await this.messageRepository.delete(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  async addReaction(messageId: string, emoji: string, userUid: string): Promise<Message | null> {
    try {
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        throw createError('Message not found', 404);
      }

      // Check if user is a member of the group
      const group = await this.groupRepository.findById(message.groupId);
      if (!group || !group.members.includes(userUid)) {
        throw createError('You are not a member of this group', 403);
      }

      const updatedMessage = await this.messageRepository.addReaction(messageId, emoji, userUid);
      return updatedMessage;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  async removeReaction(messageId: string, emoji: string, userUid: string): Promise<Message | null> {
    try {
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        throw createError('Message not found', 404);
      }

      const updatedMessage = await this.messageRepository.removeReaction(messageId, emoji, userUid);
      return updatedMessage;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  async getUserGroups(userUid: string): Promise<Group[]> {
    try {
      const groups = await this.groupRepository.findByMember(userUid);

      // Sort by updated date (most active first)
      groups.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return groups;
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }
}
