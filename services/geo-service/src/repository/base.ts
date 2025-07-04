import { Model } from 'mongoose';

/**
 * Abstract base repository class that provides common CRUD operations.
 * This class can be extended by specific repository implementations.
 */
export abstract class BaseRepository<T, M extends Model<T>> {
  protected model: M;

  constructor(model: M) {
    this.model = model;
  }

  /**
   * Count the total number of documents in the collection
   */
  async count(): Promise<number> {
    return await this.model.countDocuments();
  }

  /**
   * Create a new document in the collection
   * 
   * @param data The data to create the document with
   */
  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save() as T;
  }

  /**
   * Find a document by its ID
   * 
   * @param id The ID of the document to find
   */
  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id) as T | null;
  }

  /**
   * Find a document by an attribute query
   * 
   * @param attrs The email to search for
   */
  async findOneByAttr(attrs: Record<string, any>): Promise<T | null> {
    return await this.model.findOne(attrs) as T | null;
  }

  /**
   * Find a document by an attribute query
   * 
   * @param attrs The email to search for
   */
  async findManyByAttr(attrs: Record<string, any>): Promise<T[] | null> {
    return await this.model.find(attrs) as T[] | null;
  }

  /**
   * Update a document by its ID
   * @param id The ID of the document to update
   * @param data The data to update the document with
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }) as T | null;
  }

  /**
   * Delete a document by its ID
   * @param id The ID of the document to delete
   */
  async delete(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id) as T | null;
  }

  /**
   * Find all documents with pagination
   * @param page The page number (1-based)
   * @param limit The number of documents per page
   */
  async findAll(page: number, limit: number): Promise<T[]> {
    return await this.model.find().skip((page - 1) * limit).limit(limit) as T[];
  }
}
