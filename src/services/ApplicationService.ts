import { ApplicationRepository } from '../repositories/ApplicationRepository.js';
import { JobRepository } from '../repositories/JobRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import type {
  CreateApplicationDtoType,
  UpdateApplicationDtoType,
  GetApplicationsDtoType,
} from '../dtos/application.dto.js';
import { Application, ApplicationStatus } from '../models/Application.js';
import { createError } from '../middlewares/errorHandler.js';
import { createPaginationResponse } from '../utils/pagination.js';
import type { PaginationResult } from '../utils/pagination.js';

export class ApplicationService {
  private applicationRepository: ApplicationRepository;
  private jobRepository: JobRepository;
  private userRepository: UserRepository;

  constructor() {
    this.applicationRepository = new ApplicationRepository();
    this.jobRepository = new JobRepository();
    this.userRepository = new UserRepository();
  }

  async createApplication(
    userUid: string,
    applicationData: CreateApplicationDtoType
  ): Promise<Application> {
    try {
      // Check if job exists
      const job = await this.jobRepository.findById(applicationData.jobId);
      if (!job || !job.isActive) {
        throw createError('Job not found', 404);
      }

      // Check if user exists
      const user = await this.userRepository.findByUid(userUid);
      if (!user) {
        throw createError('User not found', 404);
      }

      // Check if user already applied to this job
      const existingApplication = await this.applicationRepository.findByUserAndJob(
        userUid,
        applicationData.jobId
      );
      if (existingApplication) {
        throw createError('You have already applied to this job', 409);
      }

      const applicationDataToCreate: Partial<Application> = {
        jobId: applicationData.jobId,
        userUid,
        status: ApplicationStatus.PENDING,
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (applicationData.resumeUrl) {
        applicationDataToCreate.resumeUrl = applicationData.resumeUrl;
      }
      if (applicationData.coverNote) {
        applicationDataToCreate.coverNote = applicationData.coverNote;
      }

      const application = await this.applicationRepository.create(applicationDataToCreate);

      // Award points for first application (if applicable)
      await this.awardApplicationPoints(userUid);

      return application;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  async getApplicationById(id: string): Promise<Application | null> {
    try {
      const application = await this.applicationRepository.findById(id);
      if (!application) {
        throw createError('Application not found', 404);
      }
      return application;
    } catch (error) {
      console.error('Error getting application by ID:', error);
      throw error;
    }
  }

  async updateApplication(
    id: string,
    applicationData: UpdateApplicationDtoType
  ): Promise<Application | null> {
    try {
      const application = await this.applicationRepository.findById(id);
      if (!application) {
        throw createError('Application not found', 404);
      }

      const updateData: Partial<Application> = {
        updatedAt: new Date(),
      };

      if (applicationData.status) {
        updateData.status = applicationData.status;
      }

      if (applicationData.employerNotes) {
        updateData.employerNotes = applicationData.employerNotes;
      }

      if (applicationData.interviewDate) {
        updateData.interviewDate = new Date(applicationData.interviewDate);
      }

      const updatedApplication = await this.applicationRepository.update(id, updateData);
      return updatedApplication;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  async deleteApplication(id: string): Promise<void> {
    try {
      const application = await this.applicationRepository.findById(id);
      if (!application) {
        throw createError('Application not found', 404);
      }

      await this.applicationRepository.delete(id);
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }

  async getUserApplications(
    userUid: string,
    queryParams: GetApplicationsDtoType
  ): Promise<PaginationResult<Application>> {
    try {
      let applications = await this.applicationRepository.findByUserUid(userUid);

      // Filter by status if provided
      if (queryParams.status) {
        applications = applications.filter(app => app.status === queryParams.status);
      }

      // Sort by applied date (newest first)
      applications.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());

      return createPaginationResponse(
        applications,
        applications.length,
        queryParams.page,
        queryParams.limit
      );
    } catch (error) {
      console.error('Error getting user applications:', error);
      throw error;
    }
  }

  async getJobApplications(jobId: string): Promise<Application[]> {
    try {
      const job = await this.jobRepository.findById(jobId);
      if (!job) {
        throw createError('Job not found', 404);
      }

      const applications = await this.applicationRepository.findByJobId(jobId);

      // Sort by applied date (newest first)
      applications.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());

      return applications;
    } catch (error) {
      console.error('Error getting job applications:', error);
      throw error;
    }
  }

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    employerNotes?: string
  ): Promise<Application | null> {
    try {
      const application = await this.applicationRepository.findById(id);
      if (!application) {
        throw createError('Application not found', 404);
      }

      const updatedApplication = await this.applicationRepository.updateStatus(
        id,
        status,
        employerNotes
      );

      // Award points for successful application status changes
      if (status === ApplicationStatus.ACCEPTED) {
        await this.awardAcceptancePoints(application.userUid);
      }

      return updatedApplication;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
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
      return await this.applicationRepository.getApplicationStats(userUid);
    } catch (error) {
      console.error('Error getting application stats:', error);
      throw error;
    }
  }

  async withdrawApplication(id: string, userUid: string): Promise<Application | null> {
    try {
      const application = await this.applicationRepository.findById(id);
      if (!application) {
        throw createError('Application not found', 404);
      }

      if (application.userUid !== userUid) {
        throw createError('Unauthorized to withdraw this application', 403);
      }

      if (application.status === ApplicationStatus.WITHDRAWN) {
        throw createError('Application already withdrawn', 400);
      }

      if (application.status === ApplicationStatus.ACCEPTED) {
        throw createError('Cannot withdraw accepted application', 400);
      }

      const updatedApplication = await this.applicationRepository.updateStatus(
        id,
        ApplicationStatus.WITHDRAWN
      );
      return updatedApplication;
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error;
    }
  }

  private async awardApplicationPoints(userUid: string): Promise<void> {
    try {
      const user = await this.userRepository.findByUid(userUid);
      if (!user) return;

      // Award points for first application
      const userApplications = await this.applicationRepository.findByUserUid(userUid);
      if (userApplications.length === 1) {
        await this.userRepository.updatePoints(userUid, 10); // 10 points for first application
      }
    } catch (error) {
      console.error('Error awarding application points:', error);
    }
  }

  private async awardAcceptancePoints(userUid: string): Promise<void> {
    try {
      // Award points for getting accepted
      await this.userRepository.updatePoints(userUid, 50); // 50 points for acceptance
    } catch (error) {
      console.error('Error awarding acceptance points:', error);
    }
  }
}
