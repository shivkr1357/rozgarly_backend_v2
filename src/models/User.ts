import { Collection } from 'fireorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  EMPLOYER = 'employer',
}

@Collection('users')
export class User {
  id!: string;
  uid!: string;
  email!: string;
  name!: string;
  photoURL?: string;
  phone?: string;
  city?: string;
  district?: string;
  skills: string[] = [];
  badges: string[] = [];
  points: number = 0;
  role: UserRole = UserRole.USER;
  isActive: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  // Subcollections are handled separately to avoid circular dependencies
  // applications?: Application[];
  // referrals?: Referral[];
}
