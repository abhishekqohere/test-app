import type { Request, Response } from 'express';
import { sendSuccess, sendCreated } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { param } from '../../utils/params';
import type { CommentService } from './comments.service';

export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const comment = await this.commentService.create(req.organizationId!, req.user!.id, req.body);
    sendCreated(res, comment);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const comments = await this.commentService.listByTask(
      req.organizationId!,
      param(req.params.taskId),
    );
    sendSuccess(res, comments);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const comment = await this.commentService.update(
      req.organizationId!,
      param(req.params.commentId),
      req.user!.id,
      req.body,
    );
    sendSuccess(res, comment);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.commentService.delete(
      req.organizationId!,
      param(req.params.commentId),
      req.user!.id,
    );
    sendSuccess(res, null, 'Comment deleted');
  });
}
