import { GetRepository } from 'fireorm';
import { BaseRepository } from './BaseRepository.js';
import { Course, CourseProvider, CourseLevel } from '../models/Course.js';

export class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super(GetRepository(Course));
  }

  async findByProvider(provider: CourseProvider): Promise<Course[]> {
    return this.findWhere('provider', provider);
  }

  async findByLevel(level: CourseLevel): Promise<Course[]> {
    return this.findWhere('level', level);
  }

  async findFreeCourses(): Promise<Course[]> {
    return this.findWhere('isFree', true);
  }

  async findActiveCourses(): Promise<Course[]> {
    return this.findWhere('isActive', true);
  }

  async findByTags(tags: string[]): Promise<Course[]> {
    const courses: Course[] = [];
    for (const tag of tags) {
      const tagCourses = await this.findWhereArrayContains('tags', tag);
      courses.push(...tagCourses);
    }
    // Remove duplicates
    return courses.filter(
      (course, index, self) => index === self.findIndex(c => c.id === course.id)
    );
  }

  async findByPriceRange(minPrice?: number, maxPrice?: number): Promise<Course[]> {
    try {
      let query = this.repository.whereEqualTo('isActive', true);

      if (minPrice !== undefined) {
        query = query.whereGreaterOrEqualThan('price', minPrice);
      }

      if (maxPrice !== undefined) {
        query = query.whereLessOrEqualThan('price', maxPrice);
      }

      return await query.find();
    } catch (error) {
      console.error('Error finding courses by price range:', error);
      return [];
    }
  }

  async searchCourses(searchTerm: string): Promise<Course[]> {
    try {
      const allCourses = await this.findActiveCourses();
      const term = searchTerm.toLowerCase();

      return allCourses.filter(
        course =>
          course.title.toLowerCase().includes(term) ||
          course.description?.toLowerCase().includes(term) ||
          course.instructor?.toLowerCase().includes(term) ||
          course.tags.some(tag => tag.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error searching courses:', error);
      return [];
    }
  }

  async getCoursesByRating(minRating: number): Promise<Course[]> {
    try {
      return await this.repository
        .whereEqualTo('isActive', true)
        .whereGreaterOrEqualThan('rating', minRating)
        .find();
    } catch (error) {
      console.error('Error finding courses by rating:', error);
      return [];
    }
  }
}
