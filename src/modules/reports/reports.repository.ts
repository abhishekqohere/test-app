import mongoose from 'mongoose';
import { Task } from '../tasks/tasks.model';
import { Project } from '../projects/projects.model';
import { Membership } from '../memberships/memberships.model';
import type {
  StatusReportItem,
  PriorityReportItem,
  TasksPerUserItem,
  ProjectProgressItem,
  OverdueTaskItem,
  OrganizationSummary,
} from './reports.types';

const notDeleted = {
  $or: [{ isDeleted: { $ne: true } }, { isDeleted: { $exists: false } }],
};

export class ReportsRepository {
  private orgId(organizationId: string) {
    return new mongoose.Types.ObjectId(organizationId);
  }

  async tasksByStatus(organizationId: string): Promise<StatusReportItem[]> {
    return Task.aggregate([
      { $match: { organizationId: this.orgId(organizationId), ...notDeleted } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  async tasksByPriority(organizationId: string): Promise<PriorityReportItem[]> {
    return Task.aggregate([
      { $match: { organizationId: this.orgId(organizationId), ...notDeleted } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $project: { _id: 0, priority: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  async tasksPerUser(organizationId: string): Promise<TasksPerUserItem[]> {
    return Task.aggregate([
      {
        $match: {
          organizationId: this.orgId(organizationId),
          assigneeId: { $ne: null },
          ...notDeleted,
        },
      },
      { $group: { _id: '$assigneeId', count: { $sum: 1 } } },
      { $project: { _id: 0, userId: { $toString: '$_id' }, count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  async projectProgress(organizationId: string): Promise<ProjectProgressItem[]> {
    return Project.aggregate([
      { $match: { organizationId: this.orgId(organizationId), archivedAt: null, ...notDeleted } },
      {
        $lookup: {
          from: 'tasks',
          let: { projectId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$projectId', '$$projectId'] },
                ...notDeleted,
              },
            },
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          as: 'taskStats',
        },
      },
      {
        $addFields: {
          total: {
            $sum: {
              $map: { input: '$taskStats', as: 's', in: '$$s.count' },
            },
          },
          completed: {
            $let: {
              vars: {
                done: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$taskStats',
                        as: 's',
                        cond: { $eq: ['$$s._id', 'Done'] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: { $ifNull: ['$$done.count', 0] },
            },
          },
        },
      },
      {
        $project: {
          projectId: { $toString: '$_id' },
          projectName: '$name',
          total: 1,
          completed: 1,
          progress: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$completed', '$total'] }, 100] }, 0] },
              0,
            ],
          },
        },
      },
    ]);
  }

  async overdueTasks(organizationId: string, limit = 50): Promise<OverdueTaskItem[]> {
    return Task.aggregate([
      {
        $match: {
          organizationId: this.orgId(organizationId),
          status: { $ne: 'Done' },
          dueDate: { $lt: new Date() },
          ...notDeleted,
        },
      },
      { $sort: { dueDate: 1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          title: 1,
          dueDate: 1,
          assigneeId: { $toString: '$assigneeId' },
          projectId: { $toString: '$projectId' },
        },
      },
    ]);
  }

  async organizationSummary(organizationId: string): Promise<OrganizationSummary> {
    const [projectStats, taskStats, members, overdue] = await Promise.all([
      Project.aggregate([
        { $match: { organizationId: this.orgId(organizationId), ...notDeleted } },
        {
          $group: {
            _id: null,
            totalProjects: { $sum: 1 },
            activeProjects: {
              $sum: {
                $cond: [{ $and: [{ $eq: ['$archivedAt', null] }, { $eq: ['$status', 'Active'] }] }, 1, 0],
              },
            },
          },
        },
      ]),
      Task.aggregate([
        { $match: { organizationId: this.orgId(organizationId), ...notDeleted } },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] },
            },
          },
        },
      ]),
      Membership.countDocuments({
        organizationId: this.orgId(organizationId),
        $or: [{ isDeleted: { $ne: true } }, { isDeleted: { $exists: false } }],
      }),
      Task.countDocuments({
        organizationId: this.orgId(organizationId),
        status: { $ne: 'Done' },
        dueDate: { $lt: new Date() },
        ...notDeleted,
      }),
    ]);

    const ps = projectStats[0] ?? { totalProjects: 0, activeProjects: 0 };
    const ts = taskStats[0] ?? { totalTasks: 0, completedTasks: 0 };

    return {
      totalProjects: ps.totalProjects,
      activeProjects: ps.activeProjects,
      totalTasks: ts.totalTasks,
      completedTasks: ts.completedTasks,
      totalMembers: members,
      overdueTasks: overdue,
    };
  }
}
