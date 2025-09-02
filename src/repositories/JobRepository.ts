import { GetRepository } from 'fireorm';
import { BaseRepository } from './BaseRepository.js';
import { Job } from '../models/Job.js';

export class JobRepository extends BaseRepository<Job> {
  constructor() {
    super(GetRepository(Job));
  }

  async findByCompany(company: string): Promise<Job[]> {
    return this.findWhere('company', company);
  }

  async findByCity(city: string): Promise<Job[]> {
    return this.findWhere('city', city);
  }

  async findByDistrict(district: string): Promise<Job[]> {
    return this.findWhere('district', district);
  }

  async findByType(type: string): Promise<Job[]> {
    return this.findWhere('type', type);
  }

  async findBySource(source: string): Promise<Job[]> {
    return this.findWhere('source', source);
  }

  async findBySkills(skills: string[]): Promise<Job[]> {
    const jobs: Job[] = [];
    for (const skill of skills) {
      const skillJobs = await this.findWhereArrayContains('skills', skill);
      jobs.push(...skillJobs);
    }
    // Remove duplicates
    return jobs.filter((job, index, self) => index === self.findIndex(j => j.id === job.id));
  }

  async findActiveJobs(): Promise<Job[]> {
    return this.findWhere('isActive', true);
  }

  async findBySalaryRange(minSalary?: number, maxSalary?: number): Promise<Job[]> {
    try {
      let query = this.repository.whereEqualTo('isActive', true);

      if (minSalary !== undefined) {
        query = query.whereGreaterOrEqualThan('salaryMin', minSalary);
      }

      if (maxSalary !== undefined) {
        query = query.whereLessOrEqualThan('salaryMax', maxSalary);
      }

      return await query.find();
    } catch (error) {
      console.error('Error finding jobs by salary range:', error);
      return [];
    }
  }

  async findByLocation(latitude: number, longitude: number, radiusKm: number): Promise<Job[]> {
    // This is a simplified implementation
    // In production, you'd want to use GeoFirestore or similar for proper geospatial queries
    try {
      const allJobs = await this.findActiveJobs();
      return allJobs.filter(job => {
        if (!job.latitude || !job.longitude) return false;

        const distance = this.calculateDistance(latitude, longitude, job.latitude, job.longitude);
        return distance <= radiusKm;
      });
    } catch (error) {
      console.error('Error finding jobs by location:', error);
      return [];
    }
  }

  async findByFingerprint(fingerprint: string): Promise<Job | null> {
    try {
      const jobs = await this.findWhere('fingerprint', fingerprint);
      return jobs.length > 0 ? jobs[0]! : null;
    } catch (error) {
      console.error(`Error finding job by fingerprint ${fingerprint}:`, error);
      return null;
    }
  }

  async searchJobs(searchTerm: string): Promise<Job[]> {
    try {
      const allJobs = await this.findActiveJobs();
      const term = searchTerm.toLowerCase();

      return allJobs.filter(
        job =>
          job.title.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term) ||
          job.description?.toLowerCase().includes(term) ||
          job.skills.some(skill => skill.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error searching jobs:', error);
      return [];
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
