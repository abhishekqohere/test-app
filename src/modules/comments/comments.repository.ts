import { BaseRepository } from '../../utils/baseRepository';
import { Comment, type IComment } from './comments.model';

export class CommentRepository extends BaseRepository<IComment> {
  constructor() {
    super(Comment);
  }

  async findByTask(taskId: string): Promise<IComment[]> {
    return this.findMany({ taskId } as Parameters<typeof this.findMany>[0]);
  }
}
