#!/usr/bin/env tsx

import { env } from '../config/env.js';
import { initializeFirebase } from '../config/firebase.js';
import { JobService } from '../services/JobService.js';
import { JobSource, JobType } from '../models/Job.js';
import axios from 'axios';

// Initialize Firebase
initializeFirebase();

const jobService = new JobService();

interface AdzunaJob {
  id: string;
  title: string;
  company: {
    display_name: string;
    logo_url?: string;
  };
  location: {
    area: string[];
    display_name: string;
  };
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  contract_type?: string;
  description?: string;
  redirect_url: string;
  created: string;
}

interface JoobleJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description?: string;
  link: string;
  date: string;
}

class JobIngestionService {
  private adzunaAppId: string;
  private adzunaAppKey: string;
  private joobleApiKey: string;

  constructor() {
    this.adzunaAppId = env.ADZUNA_APP_ID || '';
    this.adzunaAppKey = env.ADZUNA_APP_KEY || '';
    this.joobleApiKey = env.JOOBLE_API_KEY || '';
  }

  async ingestAdzunaJobs(country: string = 'in', resultsPerPage: number = 50): Promise<void> {
    if (!this.adzunaAppId || !this.adzunaAppKey) {
      console.warn('Adzuna credentials not configured, skipping Adzuna ingestion');
      return;
    }

    try {
      console.log('Starting Adzuna job ingestion', { country, resultsPerPage });

      const response = await axios.get('https://api.adzuna.com/v1/api/jobs/search/1', {
        params: {
          app_id: this.adzunaAppId,
          app_key: this.adzunaAppKey,
          results_per_page: resultsPerPage,
          what: 'developer software engineer programmer',
          where: country,
          content_type: 'application/json',
        },
      });

      const jobs = response.data.results as AdzunaJob[];
      let ingestedCount = 0;
      let duplicateCount = 0;

      for (const adzunaJob of jobs) {
        try {
          const jobData = {
            title: adzunaJob.title,
            company: adzunaJob.company.display_name,
            logoUrl: adzunaJob.company.logo_url,
            city: adzunaJob.location.area[0] || 'Unknown',
            district: adzunaJob.location.area[1] || adzunaJob.location.area[0] || 'Unknown',
            locationText: adzunaJob.location.display_name,
            salaryMin: adzunaJob.salary_min,
            salaryMax: adzunaJob.salary_max,
            currency: adzunaJob.salary_currency || 'USD',
            type: this.mapContractType(adzunaJob.contract_type),
            description: adzunaJob.description,
            skills: [], // Will be extracted from description in JobService
            requirements: [], // Default empty array
            benefits: [], // Default empty array
            source: JobSource.ADZUNA,
            externalUrl: adzunaJob.redirect_url,
            postedAt: new Date(adzunaJob.created),
          };

          await jobService.createJob(jobData);
          ingestedCount++;
        } catch (error) {
          if (error instanceof Error && error.message.includes('already exists')) {
            duplicateCount++;
          } else {
            console.error('Error ingesting Adzuna job', {
              jobId: adzunaJob.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }

      console.log('Adzuna ingestion completed', {
        totalJobs: jobs.length,
        ingested: ingestedCount,
        duplicates: duplicateCount,
      });
    } catch (error) {
      console.error('Error during Adzuna ingestion', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async ingestJoobleJobs(query: string = 'developer', location: string = 'india'): Promise<void> {
    if (!this.joobleApiKey) {
      console.warn('Jooble API key not configured, skipping Jooble ingestion');
      return;
    }

    try {
      console.log('Starting Jooble job ingestion', { query, location });

      const response = await axios.get('https://jooble.org/api/1', {
        params: {
          key: this.joobleApiKey,
          keywords: query,
          location: location,
          radius: 25,
          page: 1,
        },
      });

      const jobs = response.data.jobs as JoobleJob[];
      let ingestedCount = 0;
      let duplicateCount = 0;

      for (const joobleJob of jobs) {
        try {
          const jobData = {
            title: joobleJob.title,
            company: joobleJob.company,
            city: this.extractCityFromLocation(joobleJob.location),
            district: this.extractDistrictFromLocation(joobleJob.location),
            locationText: joobleJob.location,
            description: joobleJob.description,
            type: JobType.FULL_TIME, // Default type
            skills: [], // Will be extracted from description in JobService
            currency: 'USD', // Default currency
            requirements: [], // Default empty array
            benefits: [], // Default empty array
            source: JobSource.JOOBLE,
            externalUrl: joobleJob.link,
            postedAt: new Date(joobleJob.date),
          };

          await jobService.createJob(jobData);
          ingestedCount++;
        } catch (error) {
          if (error instanceof Error && error.message.includes('already exists')) {
            duplicateCount++;
          } else {
            console.error('Error ingesting Jooble job', {
              jobId: joobleJob.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }

      console.log('Jooble ingestion completed', {
        totalJobs: jobs.length,
        ingested: ingestedCount,
        duplicates: duplicateCount,
      });
    } catch (error) {
      console.error('Error during Jooble ingestion', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private mapContractType(contractType?: string): any {
    const mapping: Record<string, any> = {
      full_time: 'full-time',
      part_time: 'part-time',
      contract: 'contract',
      internship: 'internship',
      freelance: 'freelance',
    };
    return mapping[contractType || ''] || 'full-time';
  }

  private extractCityFromLocation(location: string): string {
    const parts = location.split(',').map(part => part.trim());
    return parts[0] || 'Unknown';
  }

  private extractDistrictFromLocation(location: string): string {
    const parts = location.split(',').map(part => part.trim());
    return parts[1] || parts[0] || 'Unknown';
  }

  async runIngestion(): Promise<void> {
    console.log('Starting job ingestion process');

    // Ingest from multiple sources
    await Promise.all([
      this.ingestAdzunaJobs('in', 50),
      this.ingestJoobleJobs('developer', 'india'),
      this.ingestJoobleJobs('software engineer', 'india'),
      this.ingestJoobleJobs('programmer', 'india'),
    ]);

    console.log('Job ingestion process completed');
  }
}

// Run ingestion if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const ingestionService = new JobIngestionService();

  ingestionService
    .runIngestion()
    .then(() => {
      console.log('Ingestion script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Ingestion script failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      process.exit(1);
    });
}

export { JobIngestionService };
