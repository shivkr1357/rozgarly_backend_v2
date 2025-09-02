import { JobRepository } from '../repositories/JobRepository.js';
import type {
  CreateJobDtoType,
  UpdateJobDtoType,
  SearchJobsDtoType,
  GetNearbyJobsDtoType,
  MatchJobsDtoType,
} from '../dtos/job.dto.js';
import { Job, JobType, JobSource } from '../models/Job.js';
import { createError } from '../middlewares/errorHandler.js';
import { calculateDistance, getCityCoordinates } from '../utils/geo.js';
import { extractSkillsFromText, calculateSkillSimilarity } from '../utils/skills.js';
import { createPaginationResponse } from '../utils/pagination.js';
import type { PaginationResult } from '../utils/pagination.js';
import { createJobFingerprint, removeDuplicateJobs } from '../utils/deduplication.js';

export class JobService {
  private jobRepository: JobRepository;

  constructor() {
    this.jobRepository = new JobRepository();
  }

  async createJob(jobData: CreateJobDtoType): Promise<Job> {
    try {
      // Extract skills from job description if not provided
      let skills = jobData.skills || [];
      if (jobData.description && skills.length === 0) {
        skills = extractSkillsFromText(jobData.description);
      }

      // Create fingerprint for deduplication
      const fingerprintData: {
        title: string;
        company: string;
        locationText: string;
        externalUrl?: string;
      } = {
        title: jobData.title,
        company: jobData.company,
        locationText: jobData.locationText,
      };

      if (jobData.externalUrl) {
        fingerprintData.externalUrl = jobData.externalUrl;
      }

      const fingerprint = createJobFingerprint(fingerprintData);

      // Check for duplicates
      const existingJob = await this.jobRepository.findByFingerprint(fingerprint);
      if (existingJob) {
        throw createError('Job already exists', 409);
      }

      // Get coordinates if not provided
      let latitude = jobData.latitude;
      let longitude = jobData.longitude;
      if (!latitude || !longitude) {
        const coords = getCityCoordinates(jobData.city);
        if (coords) {
          latitude = coords.latitude;
          longitude = coords.longitude;
        }
      }

      const jobDataToCreate: Partial<Job> = {
        type: jobData.type,
        city: jobData.city,
        district: jobData.district,
        title: jobData.title,
        company: jobData.company,
        locationText: jobData.locationText,
        currency: jobData.currency,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        source: jobData.source,
        skills,
        fingerprint,
        isActive: true,
        postedAt: new Date(),
        updatedAt: new Date(),
      };

      if (latitude !== undefined) {
        jobDataToCreate.latitude = latitude;
      }
      if (longitude !== undefined) {
        jobDataToCreate.longitude = longitude;
      }

      if (jobData.logoUrl) {
        jobDataToCreate.logoUrl = jobData.logoUrl;
      }
      if (jobData.externalUrl) {
        jobDataToCreate.externalUrl = jobData.externalUrl;
      }

      const job = await this.jobRepository.create(jobDataToCreate);

      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    try {
      const job = await this.jobRepository.findById(id);
      if (!job || !job.isActive) {
        throw createError('Job not found', 404);
      }
      return job;
    } catch (error) {
      console.error('Error getting job by ID:', error);
      throw error;
    }
  }

  async updateJob(id: string, jobData: UpdateJobDtoType): Promise<Job | null> {
    try {
      const job = await this.jobRepository.findById(id);
      if (!job) {
        throw createError('Job not found', 404);
      }

      // Update fingerprint if title, company, or location changed
      let fingerprint = job.fingerprint;
      if (jobData.title || jobData.company || jobData.locationText) {
        const fingerprintData: {
          title: string;
          company: string;
          locationText: string;
          externalUrl?: string;
        } = {
          title: jobData.title || job.title,
          company: jobData.company || job.company,
          locationText: jobData.locationText || job.locationText,
        };

        const externalUrl = jobData.externalUrl || job.externalUrl;
        if (externalUrl) {
          fingerprintData.externalUrl = externalUrl;
        }

        fingerprint = createJobFingerprint(fingerprintData);
      }

      // Extract skills if description changed
      let skills = jobData.skills || job.skills;
      if (jobData.description && !jobData.skills) {
        skills = extractSkillsFromText(jobData.description);
      }

      const jobDataToUpdate: Partial<Job> = {
        skills,
        updatedAt: new Date(),
      };

      if (fingerprint !== undefined) {
        jobDataToUpdate.fingerprint = fingerprint;
      }

      if (jobData.type !== undefined) {
        jobDataToUpdate.type = jobData.type;
      }
      if (jobData.city !== undefined) {
        jobDataToUpdate.city = jobData.city;
      }
      if (jobData.district !== undefined) {
        jobDataToUpdate.district = jobData.district;
      }
      if (jobData.title !== undefined) {
        jobDataToUpdate.title = jobData.title;
      }
      if (jobData.company !== undefined) {
        jobDataToUpdate.company = jobData.company;
      }
      if (jobData.description !== undefined) {
        jobDataToUpdate.description = jobData.description;
      }
      if (jobData.locationText !== undefined) {
        jobDataToUpdate.locationText = jobData.locationText;
      }
      if (jobData.salaryMin !== undefined) {
        jobDataToUpdate.salaryMin = jobData.salaryMin;
      }
      if (jobData.salaryMax !== undefined) {
        jobDataToUpdate.salaryMax = jobData.salaryMax;
      }
      if (jobData.currency !== undefined) {
        jobDataToUpdate.currency = jobData.currency;
      }
      if (jobData.requirements !== undefined) {
        jobDataToUpdate.requirements = jobData.requirements;
      }
      if (jobData.benefits !== undefined) {
        jobDataToUpdate.benefits = jobData.benefits;
      }
      if (jobData.logoUrl !== undefined) {
        jobDataToUpdate.logoUrl = jobData.logoUrl;
      }
      if (jobData.externalUrl !== undefined) {
        jobDataToUpdate.externalUrl = jobData.externalUrl;
      }

      const updatedJob = await this.jobRepository.update(id, jobDataToUpdate);

      return updatedJob;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  async deleteJob(id: string): Promise<void> {
    try {
      const job = await this.jobRepository.findById(id);
      if (!job) {
        throw createError('Job not found', 404);
      }

      await this.jobRepository.delete(id);
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  async searchJobs(searchParams: SearchJobsDtoType): Promise<PaginationResult<Job>> {
    try {
      let jobs: Job[] = [];

      if (searchParams.query) {
        // Text-based search
        jobs = await this.jobRepository.searchJobs(searchParams.query);
      } else {
        // Get all active jobs
        jobs = await this.jobRepository.findActiveJobs();
      }

      // Apply filters
      if (searchParams.city) {
        jobs = jobs.filter(job =>
          job.city.toLowerCase().includes(searchParams.city!.toLowerCase())
        );
      }

      if (searchParams.district) {
        jobs = jobs.filter(job =>
          job.district.toLowerCase().includes(searchParams.district!.toLowerCase())
        );
      }

      if (searchParams.type) {
        jobs = jobs.filter(job => job.type === searchParams.type);
      }

      if (searchParams.skills && searchParams.skills.length > 0) {
        jobs = jobs.filter(job =>
          searchParams.skills!.some(skill =>
            job.skills.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase()))
          )
        );
      }

      if (searchParams.salaryMin !== undefined) {
        jobs = jobs.filter(job => job.salaryMin && job.salaryMin >= searchParams.salaryMin!);
      }

      if (searchParams.salaryMax !== undefined) {
        jobs = jobs.filter(job => job.salaryMax && job.salaryMax <= searchParams.salaryMax!);
      }

      // Remove duplicates
      jobs = removeDuplicateJobs(jobs);

      // Sort by posted date (newest first)
      jobs.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());

      return createPaginationResponse(jobs, jobs.length, searchParams.page, searchParams.limit);
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  async getNearbyJobs(locationParams: GetNearbyJobsDtoType): Promise<PaginationResult<Job>> {
    try {
      const jobs = await this.jobRepository.findByLocation(
        locationParams.latitude,
        locationParams.longitude,
        locationParams.radius
      );

      // Sort by distance
      jobs.sort((a, b) => {
        if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;

        const distanceA = calculateDistance(
          { latitude: locationParams.latitude, longitude: locationParams.longitude },
          { latitude: a.latitude, longitude: a.longitude }
        );
        const distanceB = calculateDistance(
          { latitude: locationParams.latitude, longitude: locationParams.longitude },
          { latitude: b.latitude, longitude: b.longitude }
        );

        return distanceA - distanceB;
      });

      return createPaginationResponse(jobs, jobs.length, locationParams.page, locationParams.limit);
    } catch (error) {
      console.error('Error getting nearby jobs:', error);
      throw error;
    }
  }

  async matchJobs(
    matchParams: MatchJobsDtoType
  ): Promise<PaginationResult<Job & { matchScore: number }>> {
    try {
      let jobs: Job[] = [];

      // Get jobs based on location filters
      if (matchParams.city) {
        jobs = await this.jobRepository.findByCity(matchParams.city);
      } else if (matchParams.district) {
        jobs = await this.jobRepository.findByDistrict(matchParams.district);
      } else {
        jobs = await this.jobRepository.findActiveJobs();
      }

      // Filter by skills and calculate match scores
      const matchedJobs = jobs
        .map(job => {
          const skillSimilarity = calculateSkillSimilarity(matchParams.skills, job.skills);
          return {
            ...job,
            matchScore: skillSimilarity,
          };
        })
        .filter(job => job.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

      return createPaginationResponse(
        matchedJobs,
        matchedJobs.length,
        matchParams.page,
        matchParams.limit
      );
    } catch (error) {
      console.error('Error matching jobs:', error);
      throw error;
    }
  }

  async getJobsByCompany(company: string): Promise<Job[]> {
    try {
      return await this.jobRepository.findByCompany(company);
    } catch (error) {
      console.error('Error getting jobs by company:', error);
      throw error;
    }
  }

  async getJobsBySource(source: JobSource): Promise<Job[]> {
    try {
      return await this.jobRepository.findBySource(source);
    } catch (error) {
      console.error('Error getting jobs by source:', error);
      throw error;
    }
  }

  async getJobStats(): Promise<{
    total: number;
    byType: Record<JobType, number>;
    bySource: Record<JobSource, number>;
    byCity: Record<string, number>;
  }> {
    try {
      const jobs = await this.jobRepository.findActiveJobs();

      const stats = {
        total: jobs.length,
        byType: {} as Record<JobType, number>,
        bySource: {} as Record<JobSource, number>,
        byCity: {} as Record<string, number>,
      };

      // Initialize counters
      Object.values(JobType).forEach(type => (stats.byType[type] = 0));
      Object.values(JobSource).forEach(source => (stats.bySource[source] = 0));

      // Count jobs
      jobs.forEach(job => {
        stats.byType[job.type]++;
        stats.bySource[job.source]++;
        stats.byCity[job.city] = (stats.byCity[job.city] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting job stats:', error);
      throw error;
    }
  }
}
