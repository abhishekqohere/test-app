export interface CommentDTO {
  id: string;
  content: string;
  taskId: string;
  organizationId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentInput {
  content: string;
  taskId: string;
}

export interface UpdateCommentInput {
  content: string;
}
