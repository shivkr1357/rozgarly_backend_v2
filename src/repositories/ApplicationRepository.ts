import { GetRepository } from 'fireorm';
import { BaseRepository } from './BaseRepository.js';
import { Application, ApplicationStatus } from '../models/Application.js';

export class ApplicationRepository extends BaseRepository<Application> {
  constructor() {
    super(GetRepository(Application));
  }

  async findByUserUid(userUid: string): Promise<Application[]> {
    return this.findWhere('userUid', userUid);
  }

  async findByJobId(jobId: string): Promise<Application[]> {
    return this.findWhere('jobId', jobId);
  }

  async findByStatus(status: ApplicationStatus): Promise<Application[]> {
    return this.findWhere('status', status);
  }

  async findByUserAndJob(userUid: string, jobId: string): Promise<Application | null> {
    try {
      const applications = await this.repository
        .whereEqualTo('userUid', userUid)
        .whereEqualTo('jobId', jobId)
        .find();
      return applications.length > 0 ? applications[0]! : null;
    } catch (error) {
      console.error(`Error finding application by user ${userUid} and job ${jobId}:`, error);
      return null;
    }
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus,
    employerNotes?: string
  ): Promise<Application | null> {
    try {
      const updateData: Partial<Application> = {
        status,
        updatedAt: new Date(),
      };

      if (employerNotes) {
        updateData.employerNotes = employerNotes;
      }

      return await this.update(id, updateData);
    } catch (error) {
      console.error(`Error updating application status for ${id}:`, error);
      return null;
    }
  }

  async getApplicationStats(userUid: string): Promise<{
    total: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    interviewed: number;
    accepted: number;
    rejected: number;
  }> {
    try {
      const applications = await this.findByUserUid(userUid);

      return {
        total: applications.length,
        pending: applications.filter(app => app.status === ApplicationStatus.PENDING).length,
        reviewed: applications.filter(app => app.status === ApplicationStatus.REVIEWED).length,
        shortlisted: applications.filter(app => app.status === ApplicationStatus.SHORTLISTED)
          .length,
        interviewed: applications.filter(app => app.status === ApplicationStatus.INTERVIEW).length,
        accepted: applications.filter(app => app.status === ApplicationStatus.ACCEPTED).length,
        rejected: applications.filter(app => app.status === ApplicationStatus.REJECTED).length,
      };
    } catch (error) {
      console.error(`Error getting application stats for user ${userUid}:`, error);
      return {
        total: 0,
        pending: 0,
        reviewed: 0,
        shortlisted: 0,
        interviewed: 0,
        accepted: 0,
        rejected: 0,
      };
    }
  }
}
