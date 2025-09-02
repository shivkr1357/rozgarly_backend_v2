import { Collection } from 'fireorm';

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
  WITHDRAWN = 'withdrawn',
}

@Collection('applications')
export class Application {
  id!: string;
  jobId!: string;
  userUid!: string;
  status: ApplicationStatus = ApplicationStatus.PENDING;
  appliedAt: Date = new Date();
  resumeUrl?: string;
  coverNote?: string;
  employerNotes?: string;
  interviewDate?: Date;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}
