import type { Document, Model, UpdateQuery, ClientSession } from 'mongoose';
import { parsePagination, paginate, type PaginationOptions } from './pagination';
import type { PaginatedResult } from './types';

export interface SoftDeleteDocument extends Document {
  deletedAt?: Date | null;
  isDeleted?: boolean;
}

// Mongoose 9 filter typing is strict; use a loose filter type for repository queries.
type RepoFilter = Record<string, unknown>;

export abstract class BaseRepository<T extends SoftDeleteDocument> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string, session?: ClientSession): Promise<T | null> {
    const query = this.model.findOne(this.notDeleted({ _id: id }));
    if (session) query.session(session);
    return query;
  }

  async findOne(filter: RepoFilter, session?: ClientSession): Promise<T | null> {
    const query = this.model.findOne(this.notDeleted(filter));
    if (session) query.session(session);
    return query;
  }

  async findMany(filter: RepoFilter = {}): Promise<T[]> {
    return this.model.find(this.notDeleted(filter)).sort({ createdAt: -1 });
  }

  async paginate(filter: RepoFilter, options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    const { page, limit, skip } = parsePagination(options);
    const query = this.notDeleted(filter);
    const [items, total] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.model.countDocuments(query),
    ]);
    return paginate(items, total, page, limit);
  }

  async create(data: RepoFilter, session?: ClientSession): Promise<T> {
    const payload = data as never;
    if (session) {
      const docs = await this.model.create([payload], { session });
      return docs[0];
    }
    const doc = await this.model.create(payload);
    return Array.isArray(doc) ? doc[0] : doc;
  }

  async updateById(id: string, data: UpdateQuery<T>, session?: ClientSession): Promise<T | null> {
    const query = this.model.findOneAndUpdate(this.notDeleted({ _id: id }), data, {
      new: true,
      runValidators: true,
    });
    if (session) query.session(session);
    return query;
  }

  async softDelete(id: string, session?: ClientSession): Promise<T | null> {
    const query = this.model.findOneAndUpdate(
      this.notDeleted({ _id: id }),
      { deletedAt: new Date(), isDeleted: true } as UpdateQuery<T>,
      { new: true },
    );
    if (session) query.session(session);
    return query;
  }

  async hardDelete(id: string, session?: ClientSession): Promise<boolean> {
    const query = this.model.deleteOne({ _id: id });
    if (session) query.session(session);
    const result = await query;
    return result.deletedCount > 0;
  }

  async count(filter: RepoFilter = {}): Promise<number> {
    return this.model.countDocuments(this.notDeleted(filter));
  }

  protected notDeleted(filter: RepoFilter): RepoFilter {
    return {
      ...filter,
      $or: [{ isDeleted: { $ne: true } }, { isDeleted: { $exists: false } }],
    };
  }
}
