import { CourseRepository } from '../repositories/CourseRepository.js';
import type {
  CreateCourseDtoType,
  UpdateCourseDtoType,
  GetCoursesDtoType,
} from '../dtos/upskill.dto.js';
import { Course, CourseProvider, CourseLevel } from '../models/Course.js';
import { createError } from '../middlewares/errorHandler.js';
import { createPaginationResponse } from '../utils/pagination.js';
import type { PaginationResult } from '../utils/pagination.js';

export class UpskillService {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  async createCourse(courseData: CreateCourseDtoType): Promise<Course> {
    try {
      const courseDataToCreate: Partial<Course> = {
        level: courseData.level,
        title: courseData.title,
        currency: courseData.currency,
        tags: courseData.tags,
        provider: courseData.provider,
        url: courseData.url,
        isFree: courseData.isFree,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (courseData.instructor !== undefined) {
        courseDataToCreate.instructor = courseData.instructor;
      }
      if (courseData.rating !== undefined) {
        courseDataToCreate.rating = courseData.rating;
      }

      if (courseData.duration !== undefined) {
        courseDataToCreate.duration = courseData.duration;
      }
      if (courseData.thumbnailUrl !== undefined) {
        courseDataToCreate.thumbnailUrl = courseData.thumbnailUrl;
      }

      if (courseData.description) {
        courseDataToCreate.description = courseData.description;
      }
      if (courseData.price) {
        courseDataToCreate.price = courseData.price;
      }

      const course = await this.courseRepository.create(courseDataToCreate);

      return course;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const course = await this.courseRepository.findById(id);
      if (!course || !course.isActive) {
        throw createError('Course not found', 404);
      }
      return course;
    } catch (error) {
      console.error('Error getting course by ID:', error);
      throw error;
    }
  }

  async updateCourse(id: string, courseData: UpdateCourseDtoType): Promise<Course | null> {
    try {
      const course = await this.courseRepository.findById(id);
      if (!course) {
        throw createError('Course not found', 404);
      }

      const courseDataToUpdate: Partial<Course> = {
        updatedAt: new Date(),
      };

      if (courseData.level !== undefined) {
        courseDataToUpdate.level = courseData.level;
      }
      if (courseData.title !== undefined) {
        courseDataToUpdate.title = courseData.title;
      }
      if (courseData.currency !== undefined) {
        courseDataToUpdate.currency = courseData.currency;
      }
      if (courseData.description !== undefined) {
        courseDataToUpdate.description = courseData.description;
      }
      if (courseData.tags !== undefined) {
        courseDataToUpdate.tags = courseData.tags;
      }
      if (courseData.provider !== undefined) {
        courseDataToUpdate.provider = courseData.provider;
      }
      if (courseData.url !== undefined) {
        courseDataToUpdate.url = courseData.url;
      }
      if (courseData.duration !== undefined) {
        courseDataToUpdate.duration = courseData.duration;
      }
      if (courseData.thumbnailUrl !== undefined) {
        courseDataToUpdate.thumbnailUrl = courseData.thumbnailUrl;
      }
      if (courseData.instructor !== undefined) {
        courseDataToUpdate.instructor = courseData.instructor;
      }
      if (courseData.rating !== undefined) {
        courseDataToUpdate.rating = courseData.rating;
      }
      if (courseData.price !== undefined) {
        courseDataToUpdate.price = courseData.price;
      }
      if (courseData.isFree !== undefined) {
        courseDataToUpdate.isFree = courseData.isFree;
      }

      const updatedCourse = await this.courseRepository.update(id, courseDataToUpdate);

      return updatedCourse;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      const course = await this.courseRepository.findById(id);
      if (!course) {
        throw createError('Course not found', 404);
      }

      await this.courseRepository.delete(id);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  async getCourses(queryParams: GetCoursesDtoType): Promise<PaginationResult<Course>> {
    try {
      let courses: Course[] = [];

      // Apply filters
      if (queryParams.provider) {
        courses = await this.courseRepository.findByProvider(queryParams.provider);
      } else if (queryParams.level) {
        courses = await this.courseRepository.findByLevel(queryParams.level);
      } else if (queryParams.isFree !== undefined) {
        if (queryParams.isFree) {
          courses = await this.courseRepository.findFreeCourses();
        } else {
          courses = await this.courseRepository.findActiveCourses();
        }
      } else {
        courses = await this.courseRepository.findActiveCourses();
      }

      // Filter by tags if provided
      if (queryParams.tags && queryParams.tags.length > 0) {
        const tagCourses = await this.courseRepository.findByTags(queryParams.tags);
        courses = courses.filter(course =>
          tagCourses.some(tagCourse => tagCourse.id === course.id)
        );
      }

      // Filter by rating if provided
      if (queryParams.minRating !== undefined) {
        courses = courses.filter(
          course => course.rating && course.rating >= queryParams.minRating!
        );
      }

      // Filter by price range if provided
      if (queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined) {
        courses = courses.filter(course => {
          if (course.isFree)
            return queryParams.minPrice === 0 || queryParams.minPrice === undefined;
          if (!course.price) return false;

          const minPrice = queryParams.minPrice || 0;
          const maxPrice = queryParams.maxPrice || Infinity;

          return course.price >= minPrice && course.price <= maxPrice;
        });
      }

      // Search by text if provided
      if (queryParams.search) {
        const searchResults = await this.courseRepository.searchCourses(queryParams.search);
        courses = courses.filter(course =>
          searchResults.some(searchCourse => searchCourse.id === course.id)
        );
      }

      // Sort by rating (highest first), then by created date (newest first)
      courses.sort((a, b) => {
        if (a.rating && b.rating) {
          return b.rating - a.rating;
        }
        if (a.rating && !b.rating) return -1;
        if (!a.rating && b.rating) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      return createPaginationResponse(courses, courses.length, queryParams.page, queryParams.limit);
    } catch (error) {
      console.error('Error getting courses:', error);
      throw error;
    }
  }

  async getCoursesByProvider(provider: CourseProvider): Promise<Course[]> {
    try {
      const courses = await this.courseRepository.findByProvider(provider);

      // Sort by rating (highest first)
      courses.sort((a, b) => {
        if (a.rating && b.rating) {
          return b.rating - a.rating;
        }
        if (a.rating && !b.rating) return -1;
        if (!a.rating && b.rating) return 1;
        return 0;
      });

      return courses;
    } catch (error) {
      console.error('Error getting courses by provider:', error);
      throw error;
    }
  }

  async getCoursesByLevel(level: CourseLevel): Promise<Course[]> {
    try {
      const courses = await this.courseRepository.findByLevel(level);

      // Sort by rating (highest first)
      courses.sort((a, b) => {
        if (a.rating && b.rating) {
          return b.rating - a.rating;
        }
        if (a.rating && !b.rating) return -1;
        if (!a.rating && b.rating) return 1;
        return 0;
      });

      return courses;
    } catch (error) {
      console.error('Error getting courses by level:', error);
      throw error;
    }
  }

  async getFreeCourses(): Promise<Course[]> {
    try {
      const courses = await this.courseRepository.findFreeCourses();

      // Sort by rating (highest first)
      courses.sort((a, b) => {
        if (a.rating && b.rating) {
          return b.rating - a.rating;
        }
        if (a.rating && !b.rating) return -1;
        if (!a.rating && b.rating) return 1;
        return 0;
      });

      return courses;
    } catch (error) {
      console.error('Error getting free courses:', error);
      throw error;
    }
  }

  async searchCourses(searchTerm: string): Promise<Course[]> {
    try {
      const courses = await this.courseRepository.searchCourses(searchTerm);

      // Sort by rating (highest first)
      courses.sort((a, b) => {
        if (a.rating && b.rating) {
          return b.rating - a.rating;
        }
        if (a.rating && !b.rating) return -1;
        if (!a.rating && b.rating) return 1;
        return 0;
      });

      return courses;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }

  async getCourseStats(): Promise<{
    total: number;
    byProvider: Record<CourseProvider, number>;
    byLevel: Record<CourseLevel, number>;
    free: number;
    paid: number;
    averageRating: number;
  }> {
    try {
      const courses = await this.courseRepository.findActiveCourses();

      const stats = {
        total: courses.length,
        byProvider: {} as Record<CourseProvider, number>,
        byLevel: {} as Record<CourseLevel, number>,
        free: 0,
        paid: 0,
        averageRating: 0,
      };

      // Initialize counters
      Object.values(CourseProvider).forEach(provider => (stats.byProvider[provider] = 0));
      Object.values(CourseLevel).forEach(level => (stats.byLevel[level] = 0));

      let totalRating = 0;
      let ratedCourses = 0;

      // Count courses
      courses.forEach(course => {
        stats.byProvider[course.provider]++;
        stats.byLevel[course.level]++;

        if (course.isFree) {
          stats.free++;
        } else {
          stats.paid++;
        }

        if (course.rating) {
          totalRating += course.rating;
          ratedCourses++;
        }
      });

      stats.averageRating = ratedCourses > 0 ? totalRating / ratedCourses : 0;

      return stats;
    } catch (error) {
      console.error('Error getting course stats:', error);
      throw error;
    }
  }

  async getRecommendedCourses(userSkills: string[], limit: number = 10): Promise<Course[]> {
    try {
      const allCourses = await this.courseRepository.findActiveCourses();

      // Score courses based on skill overlap
      const scoredCourses = allCourses.map(course => {
        const skillOverlap = course.tags.filter(tag =>
          userSkills.some(
            skill =>
              skill.toLowerCase().includes(tag.toLowerCase()) ||
              tag.toLowerCase().includes(skill.toLowerCase())
          )
        ).length;

        const score = skillOverlap / Math.max(course.tags.length, 1);

        return {
          course,
          score,
        };
      });

      // Sort by score and return top courses
      return scoredCourses
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.course);
    } catch (error) {
      console.error('Error getting recommended courses:', error);
      throw error;
    }
  }
}
