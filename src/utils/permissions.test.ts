import { describe, it, expect } from 'vitest';
import { canUser, getRolePermissions, canManageTeam, canManageMembers, canDelete, canModify } from './permissions';
import { TeamMemberRole } from '../types/team';

describe('canUser', () => {
  it('owner can do everything', () => {
    expect(canUser('read', 'leads', 'owner')).toBe(true);
    expect(canUser('create', 'leads', 'owner')).toBe(true);
    expect(canUser('update', 'leads', 'owner')).toBe(true);
    expect(canUser('delete', 'leads', 'owner')).toBe(true);
    expect(canUser('manage_team', 'team', 'owner')).toBe(true);
    expect(canUser('manage_members', 'members', 'owner')).toBe(true);
    expect(canUser('manage_settings', 'settings', 'owner')).toBe(true);
  });

  it('admin can do almost everything except delete team and change owner', () => {
    expect(canUser('read', 'leads', 'admin')).toBe(true);
    expect(canUser('create', 'documents', 'admin')).toBe(true);
    expect(canUser('update', 'automation', 'admin')).toBe(true);
    expect(canUser('manage_settings', 'settings', 'admin')).toBe(true);
    // Cannot delete team
    expect(canUser('delete', 'team', 'admin')).toBe(false);
    // Cannot change owner
    expect(canUser('manage_team', 'members', 'admin')).toBe(false);
  });

  it('editor can read/create/update leads and documents, read automation', () => {
    expect(canUser('read', 'leads', 'editor')).toBe(true);
    expect(canUser('create', 'leads', 'editor')).toBe(true);
    expect(canUser('update', 'leads', 'editor')).toBe(true);
    expect(canUser('delete', 'leads', 'editor')).toBe(false);
    expect(canUser('read', 'documents', 'editor')).toBe(true);
    expect(canUser('create', 'documents', 'editor')).toBe(true);
    expect(canUser('update', 'documents', 'editor')).toBe(true);
    expect(canUser('delete', 'documents', 'editor')).toBe(false);
    expect(canUser('read', 'automation', 'editor')).toBe(true);
    expect(canUser('create', 'automation', 'editor')).toBe(false);
    // Cannot manage team/members/settings
    expect(canUser('read', 'team', 'editor')).toBe(false);
    expect(canUser('manage_members', 'members', 'editor')).toBe(false);
    expect(canUser('manage_settings', 'settings', 'editor')).toBe(false);
  });

  it('viewer can only read leads, documents, and automation', () => {
    expect(canUser('read', 'leads', 'viewer')).toBe(true);
    expect(canUser('read', 'documents', 'viewer')).toBe(true);
    expect(canUser('read', 'automation', 'viewer')).toBe(true);
    expect(canUser('create', 'leads', 'viewer')).toBe(false);
    expect(canUser('update', 'leads', 'viewer')).toBe(false);
    expect(canUser('delete', 'leads', 'viewer')).toBe(false);
    expect(canUser('read', 'team', 'viewer')).toBe(false);
    expect(canUser('manage_settings', 'settings', 'viewer')).toBe(false);
  });

  it('returns false for unknown roles', () => {
    expect(canUser('read', 'leads', 'unknown' as TeamMemberRole)).toBe(false);
  });
});

describe('getRolePermissions', () => {
  it('returns all actions for owner on any resource', () => {
    const perms = getRolePermissions('owner', 'leads');
    expect(perms).toContain('read');
    expect(perms).toContain('create');
    expect(perms).toContain('update');
    expect(perms).toContain('delete');
    expect(perms).toContain('manage_team');
    expect(perms).toContain('manage_members');
    expect(perms).toContain('manage_settings');
  });

  it('returns limited actions for editor on leads', () => {
    const perms = getRolePermissions('editor', 'leads');
    expect(perms).toEqual(['read', 'create', 'update']);
  });

  it('returns only read for viewer on documents', () => {
    const perms = getRolePermissions('viewer', 'documents');
    expect(perms).toEqual(['read']);
  });

  it('returns empty for viewer on team', () => {
    const perms = getRolePermissions('viewer', 'team');
    expect(perms).toEqual([]);
  });
});

describe('canManageTeam', () => {
  it('owner and admin can manage team', () => {
    expect(canManageTeam('owner')).toBe(true);
    expect(canManageTeam('admin')).toBe(true);
  });

  it('editor and viewer cannot manage team', () => {
    expect(canManageTeam('editor')).toBe(false);
    expect(canManageTeam('viewer')).toBe(false);
  });
});

describe('canManageMembers', () => {
  it('owner and admin can manage members', () => {
    expect(canManageMembers('owner')).toBe(true);
    expect(canManageMembers('admin')).toBe(true);
  });

  it('editor and viewer cannot manage members', () => {
    expect(canManageMembers('editor')).toBe(false);
    expect(canManageMembers('viewer')).toBe(false);
  });
});

describe('canDelete', () => {
  it('owner can delete any resource', () => {
    expect(canDelete('owner', 'leads')).toBe(true);
    expect(canDelete('owner', 'documents')).toBe(true);
    expect(canDelete('owner', 'team')).toBe(true);
  });

  it('admin can delete anything except team', () => {
    expect(canDelete('admin', 'leads')).toBe(true);
    expect(canDelete('admin', 'documents')).toBe(true);
    expect(canDelete('admin', 'team')).toBe(false);
  });

  it('editor and viewer cannot delete', () => {
    expect(canDelete('editor', 'leads')).toBe(false);
    expect(canDelete('viewer', 'documents')).toBe(false);
  });
});

describe('canModify', () => {
  it('owner and admin can modify anything', () => {
    expect(canModify('owner', 'leads')).toBe(true);
    expect(canModify('admin', 'settings')).toBe(true);
  });

  it('editor can modify leads and documents only', () => {
    expect(canModify('editor', 'leads')).toBe(true);
    expect(canModify('editor', 'documents')).toBe(true);
    expect(canModify('editor', 'automation')).toBe(false);
    expect(canModify('editor', 'team')).toBe(false);
  });

  it('viewer cannot modify anything', () => {
    expect(canModify('viewer', 'leads')).toBe(false);
    expect(canModify('viewer', 'documents')).toBe(false);
  });
});
