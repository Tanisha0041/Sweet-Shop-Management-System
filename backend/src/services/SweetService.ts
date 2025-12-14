import { DataSource, Repository, Like, Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Sweet, SweetCategory } from '../entities/Sweet';

/**
 * Interface for creating a sweet
 */
export interface CreateSweetData {
  name: string;
  description?: string;
  category: SweetCategory;
  price: number;
  quantity: number;
  imageUrl?: string;
}

/**
 * Interface for updating a sweet
 */
export interface UpdateSweetData {
  name?: string;
  description?: string;
  category?: SweetCategory;
  price?: number;
  quantity?: number;
  imageUrl?: string;
}

/**
 * Interface for search parameters
 */
export interface SearchParams {
  name?: string;
  category?: SweetCategory;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Sweet Service
 * Handles CRUD operations for sweets
 */
export class SweetService {
  private sweetRepository: Repository<Sweet>;

  constructor(dataSource: DataSource) {
    this.sweetRepository = dataSource.getRepository(Sweet);
  }

  /**
   * Create a new sweet
   * @param data - Sweet data
   * @returns Created sweet
   */
  async create(data: CreateSweetData): Promise<Sweet> {
    const sweet = this.sweetRepository.create(data);
    return await this.sweetRepository.save(sweet);
  }

  /**
   * Get all sweets
   * @returns Array of all sweets
   */
  async findAll(): Promise<Sweet[]> {
    return await this.sweetRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a sweet by ID
   * @param id - Sweet ID
   * @returns Sweet or null
   */
  async findById(id: string): Promise<Sweet | null> {
    return await this.sweetRepository.findOne({
      where: { id },
    });
  }

  /**
   * Search sweets with filters
   * @param params - Search parameters
   * @returns Array of matching sweets
   */
  async search(params: SearchParams): Promise<Sweet[]> {
    const where: FindOptionsWhere<Sweet>[] = [{}];
    const conditions: FindOptionsWhere<Sweet> = {};

    // Build where conditions
    if (params.name) {
      conditions.name = Like(`%${params.name}%`);
    }

    if (params.category) {
      conditions.category = params.category;
    }

    // Handle price range
    if (params.minPrice !== undefined && params.maxPrice !== undefined) {
      conditions.price = Between(params.minPrice, params.maxPrice);
    } else if (params.minPrice !== undefined) {
      conditions.price = MoreThanOrEqual(params.minPrice);
    } else if (params.maxPrice !== undefined) {
      conditions.price = LessThanOrEqual(params.maxPrice);
    }

    return await this.sweetRepository.find({
      where: conditions,
      order: { name: 'ASC' },
    });
  }

  /**
   * Update a sweet
   * @param id - Sweet ID
   * @param data - Update data
   * @returns Updated sweet or null
   */
  async update(id: string, data: UpdateSweetData): Promise<Sweet | null> {
    const sweet = await this.findById(id);
    if (!sweet) {
      return null;
    }

    Object.assign(sweet, data);
    return await this.sweetRepository.save(sweet);
  }

  /**
   * Delete a sweet
   * @param id - Sweet ID
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.sweetRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Purchase a sweet - decrease quantity
   * @param id - Sweet ID
   * @param quantity - Quantity to purchase
   * @returns Updated sweet
   */
  async purchase(id: string, quantity: number = 1): Promise<Sweet> {
    const sweet = await this.findById(id);
    if (!sweet) {
      throw new Error('Sweet not found');
    }

    if (quantity <= 0) {
      throw new Error('Purchase quantity must be positive');
    }

    if (sweet.quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    sweet.purchase(quantity);
    return await this.sweetRepository.save(sweet);
  }

  /**
   * Restock a sweet - increase quantity
   * @param id - Sweet ID
   * @param quantity - Quantity to add
   * @returns Updated sweet
   */
  async restock(id: string, quantity: number): Promise<Sweet> {
    const sweet = await this.findById(id);
    if (!sweet) {
      throw new Error('Sweet not found');
    }

    if (quantity <= 0) {
      throw new Error('Restock quantity must be positive');
    }

    sweet.restock(quantity);
    return await this.sweetRepository.save(sweet);
  }
}
