import {
  hasMinimumRole,
  canManageMembers,
  canManageProjects,
  canDeleteOrganization,
  canChangeRole,
  canAssignRole,
} from '../../utils/permissions';

describe('permissions', () => {
  describe('hasMinimumRole', () => {
    it('Owner has all roles', () => {
      expect(hasMinimumRole('Owner', 'Member')).toBe(true);
      expect(hasMinimumRole('Owner', 'Owner')).toBe(true);
    });

    it('Member cannot access Admin', () => {
      expect(hasMinimumRole('Member', 'Admin')).toBe(false);
    });

    it('Manager meets Manager requirement', () => {
      expect(hasMinimumRole('Manager', 'Manager')).toBe(true);
    });
  });

  describe('canManageMembers', () => {
    it('allows Admin and Owner', () => {
      expect(canManageMembers('Admin')).toBe(true);
      expect(canManageMembers('Owner')).toBe(true);
    });

    it('denies Member', () => {
      expect(canManageMembers('Member')).toBe(false);
    });
  });

  describe('canManageProjects', () => {
    it('allows Manager and above', () => {
      expect(canManageProjects('Manager')).toBe(true);
      expect(canManageProjects('Admin')).toBe(true);
    });

    it('denies Member', () => {
      expect(canManageProjects('Member')).toBe(false);
    });
  });

  describe('canDeleteOrganization', () => {
    it('only Owner can delete', () => {
      expect(canDeleteOrganization('Owner')).toBe(true);
      expect(canDeleteOrganization('Admin')).toBe(false);
    });
  });

  describe('canChangeRole', () => {
    it('Owner can change any role', () => {
      expect(canChangeRole('Owner', 'Admin')).toBe(true);
    });

    it('Admin cannot change Owner', () => {
      expect(canChangeRole('Admin', 'Owner')).toBe(false);
    });
  });

  describe('canAssignRole', () => {
    it('Admin cannot assign Owner', () => {
      expect(canAssignRole('Admin', 'Owner')).toBe(false);
    });

    it('Owner can assign Owner', () => {
      expect(canAssignRole('Owner', 'Owner')).toBe(true);
    });
  });
});
