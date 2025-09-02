import { Collection, SubCollection } from 'fireorm';

export enum GroupType {
  GENERAL = 'general',
  SKILL_BASED = 'skill-based',
  LOCATION_BASED = 'location-based',
  COMPANY_BASED = 'company-based',
}

@Collection('messages')
export class Message {
  id!: string;
  groupId!: string;
  senderUid!: string;
  content!: string;
  type: 'text' | 'image' | 'file' = 'text';
  metadata?: Record<string, any>;
  reactions: Record<string, string[]> = {}; // emoji -> array of user UIDs
  isEdited: boolean = false;
  editedAt?: Date;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}

@Collection('groups')
export class Group {
  id!: string;
  name!: string;
  description?: string;
  type: GroupType = GroupType.GENERAL;
  members: string[] = []; // Array of user UIDs
  admins: string[] = []; // Array of user UIDs
  isPublic: boolean = true;
  maxMembers?: number;
  tags: string[] = [];
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  @SubCollection(Message, 'messages')
  messages?: Message[];
}
