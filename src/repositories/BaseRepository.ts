import { BaseFirestoreRepository } from 'fireorm';

// Define IEntity interface locally to avoid import issues
interface IEntity {
  id: string;
}

export abstract class BaseRepository<T extends IEntity> {
  protected repository: BaseFirestoreRepository<T>;

  constructor(repository: BaseFirestoreRepository<T>) {
    this.repository = repository;
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      console.error(`Error finding ${this.constructor.name} by id ${id}:`, error);
      return null;
    }
  }

  async findAll(): Promise<T[]> {
    try {
      return await this.repository.find();
    } catch (error) {
      console.error(`Error finding all ${this.constructor.name}:`, error);
      return [];
    }
  }

  async create(entity: Partial<T>): Promise<T> {
    try {
      return await this.repository.create(entity as T);
    } catch (error) {
      console.error(`Error creating ${this.constructor.name}:`, error);
      throw error;
    }
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error(`Entity with id ${id} not found`);
      }
      const updated = { ...existing, ...entity };
      return await this.repository.update(updated);
    } catch (error) {
      console.error(`Error updating ${this.constructor.name} with id ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      console.error(`Error deleting ${this.constructor.name} with id ${id}:`, error);
      throw error;
    }
  }

  async findWhere(field: keyof T, value: any): Promise<T[]> {
    try {
      return await this.repository.whereEqualTo(field as any, value).find();
    } catch (error) {
      console.error(
        `Error finding ${this.constructor.name} where ${String(field)} = ${value}:`,
        error
      );
      return [];
    }
  }

  async findWhereArrayContains(field: keyof T, value: any): Promise<T[]> {
    try {
      return await this.repository.whereArrayContains(field as any, value).find();
    } catch (error) {
      console.error(
        `Error finding ${this.constructor.name} where ${String(field)} contains ${value}:`,
        error
      );
      return [];
    }
  }

  async findWhereGreaterThan(field: keyof T, value: any): Promise<T[]> {
    try {
      return await this.repository.whereGreaterThan(field as any, value).find();
    } catch (error) {
      console.error(
        `Error finding ${this.constructor.name} where ${String(field)} > ${value}:`,
        error
      );
      return [];
    }
  }

  async findWhereLessThan(field: keyof T, value: any): Promise<T[]> {
    try {
      return await this.repository.whereLessThan(field as any, value).find();
    } catch (error) {
      console.error(
        `Error finding ${this.constructor.name} where ${String(field)} < ${value}:`,
        error
      );
      return [];
    }
  }

  async findWhereGreaterThanOrEqual(field: keyof T, value: any): Promise<T[]> {
    try {
      return await this.repository.whereGreaterOrEqualThan(field as any, value).find();
    } catch (error) {
      console.error(
        `Error finding ${this.constructor.name} where ${String(field)} >= ${value}:`,
        error
      );
      return [];
    }
  }

  async findWhereLessThanOrEqual(field: keyof T, value: any): Promise<T[]> {
    try {
      return await this.repository.whereLessOrEqualThan(field as any, value).find();
    } catch (error) {
      console.error(
        `Error finding ${this.constructor.name} where ${String(field)} <= ${value}:`,
        error
      );
      return [];
    }
  }
}
