import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { getIO } from '../config/socket.js';
import { sendEmail } from '../utils/email.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const emailTemplate = ({ title, body, ctaLabel, ctaUrl }) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
    <h2 style="margin: 0 0 12px; font-size: 18px; color: #4f46e5;">${title}</h2>
    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #334155;">${body}</p>
    ${
      ctaUrl
        ? `<a href="${ctaUrl}" style="display: inline-block; padding: 10px 18px; background: #4f46e5; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">${ctaLabel || 'View'}</a>`
        : ''
    }
    <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8;">
      You are receiving this email because you have an active Task Manager account.
      You can manage your notification preferences from your profile settings.
    </p>
  </div>
`;

/**
 * Create and persist a notification, then fan it out via socket + email.
 *
 * @param {Object} params
 * @param {string} params.recipientId  - User._id that should receive the notification
 * @param {string} [params.actorId]    - User._id that triggered it
 * @param {string} params.type
 * @param {string} params.title
 * @param {string} [params.body]
 * @param {string} [params.href]
 * @param {string} [params.projectId]
 * @param {string} [params.taskId]
 * @param {Object} [params.metadata]
 * @param {Object} [params.email]      - { subject, body, ctaLabel, ctaUrl } - if omitted, no email is sent
 * @param {boolean} [params.persist=true] - if false, only emit the socket event (no DB row)
 */
export const createNotification = async ({
  recipientId,
  actorId = null,
  type = 'system',
  title,
  body = '',
  href = null,
  projectId = null,
  taskId = null,
  metadata = {},
  email = null,
  persist = true,
}) => {
  if (!recipientId) return null;

  // Don't notify yourself
  if (actorId && actorId.toString() === recipientId.toString()) {
    return null;
  }

  let notification = null;

  if (persist) {
    try {
      notification = await Notification.create({
        recipientId,
        actorId,
        type,
        title,
        body,
        href,
        projectId,
        taskId,
        metadata,
      });
    } catch (err) {
      console.error('Failed to persist notification:', err.message);
    }
  }

  // Emit socket event in the recipient's private room
  try {
    const io = getIO();
    io.to(`user:${recipientId.toString()}`).emit('notification:new', {
      ...(notification ? notification.toJSON() : { id: `tmp-${Date.now()}` }),
      title,
      body,
      type,
      href,
      projectId,
      taskId,
      metadata,
      createdAt: notification?.createdAt || new Date().toISOString(),
    });
  } catch (err) {
    // Socket isn't initialised (e.g. in tests) - fall back to DB only
  }

  // Fire-and-forget email
  if (email) {
    sendNotificationEmail(recipientId, email, { title, body }).catch((err) => {
      console.error('Notification email failed:', err.message);
    });
  }

  return notification;
};

const sendNotificationEmail = async (recipientId, emailPayload, fallback) => {
  if (!emailPayload) return;
  try {
    const user = await User.findById(recipientId).select('email name');
    if (!user) return;

    const ctaUrl = emailPayload.ctaUrl
      ? `${FRONTEND_URL}${emailPayload.ctaUrl}`
      : fallback.body && fallback.href
        ? `${FRONTEND_URL}${fallback.href}`
        : null;

    await sendEmail({
      to: user.email,
      subject: emailPayload.subject || fallback.title,
      html: emailTemplate({
        title: emailPayload.subject || fallback.title,
        body: emailPayload.body || fallback.body,
        ctaLabel: emailPayload.ctaLabel,
        ctaUrl,
      }),
    });
  } catch (err) {
    console.error('sendNotificationEmail error:', err.message);
  }
};

/**
 * Build a friendly deep link for a task within a project
 */
export const buildTaskHref = (project, task) => {
  if (!project) return null;
  if (task) return `/projects/${project.slug}?taskId=${task._id || task.id}`;
  return `/projects/${project.slug}`;
};

/**
 * Convenience: notify the assignee of a task
 */
export const notifyTaskAssigned = async ({ task, project, actorId }) => {
  if (!task?.assigneeId) return;
  const assigneeId =
    typeof task.assigneeId === 'object' ? task.assigneeId._id : task.assigneeId;
  if (!assigneeId) return;

  const projectName = project?.name || 'your project';
  return createNotification({
    recipientId: assigneeId,
    actorId,
    type: 'task_assigned',
    title: `You were assigned "${task.title}"`,
    body: `You've been added as the assignee on ${projectName}.`,
    href: buildTaskHref(project, task),
    projectId: project?._id,
    taskId: task._id || task.id,
    metadata: { priority: task.priority, dueDate: task.dueDate },
    email: {
      subject: `New task assigned: ${task.title}`,
      body: `You have been assigned <strong>${task.title}</strong> in <strong>${projectName}</strong>. Open the project to see the full details.`,
      ctaLabel: 'Open task',
      ctaUrl: buildTaskHref(project, task),
    },
  });
};

/**
 * Convenience: notify when a task is updated (excluding the actor themselves)
 */
export const notifyTaskUpdated = async ({ task, project, actor, changes = {} }) => {
  if (!task) return;
  const recipientIds = new Set();

  const assigneeId =
    typeof task.assigneeId === 'object' ? task.assigneeId?._id : task.assigneeId;
  if (assigneeId) recipientIds.add(assigneeId.toString());

  const creatorId =
    typeof task.creatorId === 'object' ? task.creatorId?._id : task.creatorId;
  if (creatorId) recipientIds.add(creatorId.toString());

  if (project?.ownerId) recipientIds.add(project.ownerId.toString());

  recipientIds.delete(actor?._id?.toString?.());

  const changeSummary = Object.keys(changes)
    .filter((k) => changes[k] !== undefined)
    .join(', ');

  await Promise.all(
    Array.from(recipientIds).map((recipientId) =>
      createNotification({
        recipientId,
        actorId: actor?._id,
        type: 'task_updated',
        title: `Task updated: ${task.title}`,
        body: changeSummary
          ? `${actor?.name || 'Someone'} updated ${changeSummary}.`
          : `${actor?.name || 'Someone'} updated this task.`,
        href: buildTaskHref(project, task),
        projectId: project?._id,
        taskId: task._id || task.id,
        metadata: { changes },
        email: null,
      }),
    ),
  );
};

/**
 * Convenience: notify the assignee + creator + owner that the task was completed
 */
export const notifyTaskCompleted = async ({ task, project, actor }) => {
  if (!task) return;
  const recipientIds = new Set();

  const assigneeId =
    typeof task.assigneeId === 'object' ? task.assigneeId?._id : task.assigneeId;
  if (assigneeId) recipientIds.add(assigneeId.toString());

  const creatorId =
    typeof task.creatorId === 'object' ? task.creatorId?._id : task.creatorId;
  if (creatorId) recipientIds.add(creatorId.toString());

  if (project?.ownerId) recipientIds.add(project.ownerId.toString());

  recipientIds.delete(actor?._id?.toString?.());

  await Promise.all(
    Array.from(recipientIds).map((recipientId) =>
      createNotification({
        recipientId,
        actorId: actor?._id,
        type: 'task_completed',
        title: `Task completed: ${task.title}`,
        body: `${actor?.name || 'Someone'} marked this task as done.`,
        href: buildTaskHref(project, task),
        projectId: project?._id,
        taskId: task._id || task.id,
      }),
    ),
  );
};

/**
 * Convenience: notify a user that they were added to a project
 */
export const notifyProjectMemberAdded = async ({ project, member, actor }) => {
  if (!project || !member?.userId) return;

  const recipientId =
    typeof member.userId === 'object' ? member.userId._id : member.userId;

  return createNotification({
    recipientId,
    actorId: actor?._id,
    type: 'project_member_added',
    title: `Added to project: ${project.name}`,
    body: `You were added as ${member.role || 'a member'} on "${project.name}".`,
    href: `/projects/${project.slug}`,
    projectId: project._id,
    email: {
      subject: `You've been added to ${project.name}`,
      body: `<strong>${actor?.name || 'A project owner'}</strong> added you to the <strong>${project.name}</strong> project on Task Manager.`,
      ctaLabel: 'View project',
      ctaUrl: `/projects/${project.slug}`,
    },
  });
};

export { Notification };
