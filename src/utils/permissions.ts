import type { Role } from './types';

const ROLE_HIERARCHY: Record<Role, number> = {
  Owner: 4,
  Admin: 3,
  Manager: 2,
  Member: 1,
};

export const hasMinimumRole = (userRole: Role, requiredRole: Role): boolean =>
  ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];

export const canManageMembers = (role: Role): boolean => hasMinimumRole(role, 'Admin');

export const canManageProjects = (role: Role): boolean => hasMinimumRole(role, 'Member');

export const canDeleteOrganization = (role: Role): boolean => role === 'Owner';

export const canChangeRole = (actorRole: Role, targetRole: Role): boolean => {
  if (actorRole === 'Owner') return true;
  if (actorRole === 'Admin') return targetRole !== 'Owner' && actorRole !== targetRole;
  return false;
};

export const canAssignRole = (actorRole: Role, newRole: Role): boolean => {
  if (actorRole === 'Owner') return true;
  if (actorRole === 'Admin') return newRole !== 'Owner';
  return false;
};
