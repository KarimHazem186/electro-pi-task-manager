/**
 * Global search controller
 *
 * Returns projects + tasks the current user has access to, optionally filtered
 * by entity type. Mirrors the access rules used by getProjects / getTasks so we
 * never leak data the user can't already see in the regular lists.
 */
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../middleware/error.js';

const MAX_RESULTS_PER_GROUP = 8;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @route   GET /api/search
 * @desc    Global search across projects and tasks
 * @access  Private
 * @query   q      - search term (required, min 2 chars)
 * @query   types  - comma-separated subset of "projects,tasks" (default: both)
 * @query   limit  - max results per group (default 8, max 20)
 */
export const globalSearch = asyncHandler(async (req, res) => {
  const rawQuery = (req.query.q ?? '').toString().trim();
  const typesParam = (req.query.types ?? 'projects,tasks').toString();
  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || MAX_RESULTS_PER_GROUP, 1),
    20,
  );

  if (rawQuery.length < 2) {
    return res.json({ success: true, data: { projects: [], tasks: [], query: rawQuery } });
  }

  const types = new Set(
    typesParam
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
  );
  const wantProjects = types.size === 0 || types.has('projects');
  const wantTasks = types.size === 0 || types.has('tasks');

  // Compute accessible project ids for non-admins (used for both queries)
  let accessibleProjectIds = null;
  if (req.user.role !== 'admin') {
    const memberships = await ProjectMember.find({ userId: req.user._id }).select('projectId');
    const ownedProjects = await Project.find({ ownerId: req.user._id }).select('_id');
    accessibleProjectIds = [
      ...memberships.map((m) => m.projectId.toString()),
      ...ownedProjects.map((p) => p._id.toString()),
    ];
  }

  const regex = new RegExp(escapeRegex(rawQuery), 'i');

  const results = { projects: [], tasks: [], query: rawQuery };

  if (wantProjects) {
    const projectQuery = accessibleProjectIds
      ? { $or: [{ ownerId: req.user._id }, { _id: { $in: accessibleProjectIds } }] }
      : {};

    projectQuery.$or = [
      ...(projectQuery.$or ?? []).filter((c) => !c.name && !c.description),
      { name: regex },
      { description: regex },
      { slug: regex },
    ];

    // If the user isn't admin, ensure we never search across inaccessible projects
    if (req.user.role !== 'admin') {
      projectQuery.$and = [
        {
          $or: [
            { ownerId: req.user._id },
            { _id: { $in: accessibleProjectIds } },
          ],
        },
      ];
      delete projectQuery.$or;
      projectQuery.$and.push({ $or: [{ name: regex }, { description: regex }, { slug: regex }] });
    }

    const projects = await Project.find(projectQuery)
      .select('name slug description status ownerId coverImage')
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(limit);

    results.projects = projects.map((p) => {
      const obj = p.toJSON ? p.toJSON() : p;
      return {
        id: obj.id,
        name: obj.name,
        slug: obj.slug,
        description: obj.description,
        status: obj.status,
        ownerId: obj.ownerId,
        coverImage: obj.coverImage ?? null,
      };
    });
  }

  if (wantTasks) {
    const taskQuery = {
      $or: [{ title: regex }, { description: regex }],
    };

    if (req.user.role !== 'admin') {
      taskQuery.projectId = { $in: accessibleProjectIds };
    }

    const tasks = await Task.find(taskQuery)
      .select('title description status priority projectId assigneeId dueDate')
      .populate('assigneeId', 'name email avatarUrl role')
      .populate('projectId', 'name slug')
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(limit);

    results.tasks = tasks.map((t) => {
      const obj = t.toJSON ? t.toJSON() : t.toObject();
      // Project may come populated or as an id
      const projectInfo =
        obj.projectId && typeof obj.projectId === 'object'
          ? { id: obj.projectId._id?.toString?.() ?? obj.projectId.id, name: obj.projectId.name, slug: obj.projectId.slug }
          : { id: obj.projectId };

      const assigneeInfo =
        obj.assigneeId && typeof obj.assigneeId === 'object'
          ? {
              id: obj.assigneeId._id?.toString?.() ?? obj.assigneeId.id,
              name: obj.assigneeId.name,
              avatarUrl: obj.assigneeId.avatarUrl ?? null,
            }
          : null;

      return {
        id: obj._id?.toString?.() ?? obj.id,
        title: obj.title,
        description: obj.description,
        status: obj.status,
        priority: obj.priority,
        dueDate: obj.dueDate,
        project: projectInfo,
        assignee: assigneeInfo,
      };
    });
  }

  res.json({ success: true, data: results });
});
