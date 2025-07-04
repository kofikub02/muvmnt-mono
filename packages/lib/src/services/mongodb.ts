import mongoose, { connect, Model, Document } from "mongoose";
import { winstonLogger } from "../utils/logger";

const logger = winstonLogger('[MongoDB]');

let connectionPromise: Promise<typeof mongoose> | null = null;

/**
 * Connects to MongoDB using the provided URI.
 * Ensures a singleton connection and handles connection events.
 *
 * @param mongodbUri - The MongoDB connection string.
 * @returns A promise that resolves to the mongoose instance.
 * @throws If connection fails, the error is thrown.
 */
export async function connectMongoDB(mongodbUri: string): Promise<typeof mongoose> {
    try {
        if (isMongoConnected()) {
            logger.info("Using existing MongoDB connection");
            return mongoose;
        }

        if (connectionPromise) {
            logger.info('Connection already in progress, waiting');
            return connectionPromise;
        }

        connectionPromise = connect(mongodbUri, {
            
        });

        const connection = await connectionPromise;
        logger.debug('MongoDB successfully connected');
            
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });
          
        mongoose.connection.on('disconnected', () => {
            logger.info('MongoDB disconnected');
            connectionPromise = null;
        });
          
        return connection;
    } catch (error) {
        logger.error("Error connecting to MongoDB:", error);
        connectionPromise = null;
        throw error;
    }  
}

/**
 * Checks if there is an active MongoDB connection.
 *
 * @returns True if connected, false otherwise.
 */
export function isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
}

/**
 * Abstract base repository class that provides common CRUD operations.
 * This class can be extended by specific repository implementations.
 */
export abstract class BaseMongoDBRepository<T extends Document, M extends Model<T>> {
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
   * @param data The data to create the document with
   */
  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save() as T;
  }

  /**
   * Find a document by its ID
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
    return await this.model.findOne(attrs as any) as T | null;
  }

  /**
   * Find a document by an attribute query
   * 
   * @param attrs The email to search for
   */
  async findManyByAttr(attrs: Record<string, any>): Promise<T[] | null> {
    return await this.model.find(attrs as any) as T[] | null;
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
