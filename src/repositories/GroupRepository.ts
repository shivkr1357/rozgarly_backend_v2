import { GetRepository } from 'fireorm';
import { BaseRepository } from './BaseRepository.js';
import { Group, GroupType, Message } from '../models/Group.js';

export class GroupRepository extends BaseRepository<Group> {
  constructor() {
    super(GetRepository(Group));
  }

  async findByType(type: GroupType): Promise<Group[]> {
    return this.findWhere('type', type);
  }

  async findPublicGroups(): Promise<Group[]> {
    return this.findWhere('isPublic', true);
  }

  async findByMember(userUid: string): Promise<Group[]> {
    return this.findWhereArrayContains('members', userUid);
  }

  async findByAdmin(userUid: string): Promise<Group[]> {
    return this.findWhereArrayContains('admins', userUid);
  }

  async findByTags(tags: string[]): Promise<Group[]> {
    const groups: Group[] = [];
    for (const tag of tags) {
      const tagGroups = await this.findWhereArrayContains('tags', tag);
      groups.push(...tagGroups);
    }
    // Remove duplicates
    return groups.filter((group, index, self) => index === self.findIndex(g => g.id === group.id));
  }

  async addMember(groupId: string, userUid: string): Promise<Group | null> {
    try {
      const group = await this.findById(groupId);
      if (!group) return null;

      if (!group.members.includes(userUid)) {
        return await this.update(groupId, {
          members: [...group.members, userUid],
          updatedAt: new Date(),
        });
      }
      return group;
    } catch (error) {
      console.error(`Error adding member to group ${groupId}:`, error);
      return null;
    }
  }

  async removeMember(groupId: string, userUid: string): Promise<Group | null> {
    try {
      const group = await this.findById(groupId);
      if (!group) return null;

      return await this.update(groupId, {
        members: group.members.filter(uid => uid !== userUid),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error removing member from group ${groupId}:`, error);
      return null;
    }
  }

  async addAdmin(groupId: string, userUid: string): Promise<Group | null> {
    try {
      const group = await this.findById(groupId);
      if (!group) return null;

      if (!group.admins.includes(userUid)) {
        return await this.update(groupId, {
          admins: [...group.admins, userUid],
          updatedAt: new Date(),
        });
      }
      return group;
    } catch (error) {
      console.error(`Error adding admin to group ${groupId}:`, error);
      return null;
    }
  }

  async removeAdmin(groupId: string, userUid: string): Promise<Group | null> {
    try {
      const group = await this.findById(groupId);
      if (!group) return null;

      return await this.update(groupId, {
        admins: group.admins.filter(uid => uid !== userUid),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error removing admin from group ${groupId}:`, error);
      return null;
    }
  }
}

export class MessageRepository extends BaseRepository<Message> {
  constructor() {
    super(GetRepository(Message));
  }

  async findByGroupId(groupId: string): Promise<Message[]> {
    return this.findWhere('groupId', groupId);
  }

  async findBySender(senderUid: string): Promise<Message[]> {
    return this.findWhere('senderUid', senderUid);
  }

  async getRecentMessages(groupId: string, limit: number = 50): Promise<Message[]> {
    try {
      return await this.repository
        .whereEqualTo('groupId', groupId)
        .orderByDescending('createdAt')
        .limit(limit)
        .find();
    } catch (error) {
      console.error(`Error getting recent messages for group ${groupId}:`, error);
      return [];
    }
  }

  async addReaction(messageId: string, emoji: string, userUid: string): Promise<Message | null> {
    try {
      const message = await this.findById(messageId);
      if (!message) return null;

      const reactions = { ...message.reactions };
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }

      if (!reactions[emoji].includes(userUid)) {
        reactions[emoji].push(userUid);
      }

      return await this.update(messageId, {
        reactions,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error adding reaction to message ${messageId}:`, error);
      return null;
    }
  }

  async removeReaction(messageId: string, emoji: string, userUid: string): Promise<Message | null> {
    try {
      const message = await this.findById(messageId);
      if (!message) return null;

      const reactions = { ...message.reactions };
      if (reactions[emoji]) {
        reactions[emoji] = reactions[emoji].filter(uid => uid !== userUid);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      }

      return await this.update(messageId, {
        reactions,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error removing reaction from message ${messageId}:`, error);
      return null;
    }
  }
}
