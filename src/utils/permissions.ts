/**
 * Permission system for team-based access control
 */

import { TeamMemberRole } from '../types/team';

export type PermissionAction = 
  | 'read' 
  | 'create' 
  | 'update' 
  | 'delete'
  | 'manage_team'
  | 'manage_members'
  | 'manage_settings';

export type PermissionResource = 
  | 'leads' 
  | 'documents' 
  | 'automation' 
  | 'team' 
  | 'members'
  | 'settings';

/**
 * Check if a user with a given role can perform an action on a resource
 */
export const canUser = (
  action: PermissionAction,
  resource: PermissionResource,
  role: TeamMemberRole
): boolean => {
  // Owner can do everything
  if (role === 'owner') {
    return true;
  }

  // Admin can do everything except delete team or change owner
  if (role === 'admin') {
    if (resource === 'team' && action === 'delete') {
      return false; // Cannot delete team
    }
    if (resource === 'members' && action === 'manage_team') {
      return false; // Cannot change owner
    }
    return true;
  }

  // Editor can create/update/read leads and documents, read automation
  if (role === 'editor') {
    if (resource === 'leads' || resource === 'documents') {
      return action === 'read' || action === 'create' || action === 'update';
    }
    if (resource === 'automation') {
      return action === 'read';
    }
    // Cannot manage team, members, or settings
    return false;
  }

  // Viewer can only read
  if (role === 'viewer') {
    return action === 'read' && (
      resource === 'leads' || 
      resource === 'documents' || 
      resource === 'automation'
    );
  }

  return false;
};

/**
 * Get all actions a role can perform on a resource
 */
export const getRolePermissions = (
  role: TeamMemberRole,
  resource: PermissionResource
): PermissionAction[] => {
  const actions: PermissionAction[] = [
    'read',
    'create',
    'update',
    'delete',
    'manage_team',
    'manage_members',
    'manage_settings',
  ];

  return actions.filter(action => canUser(action, resource, role));
};

/**
 * Check if user can manage team (owner/admin only)
 */
export const canManageTeam = (role: TeamMemberRole): boolean => {
  return role === 'owner' || role === 'admin';
};

/**
 * Check if user can manage team members
 */
export const canManageMembers = (role: TeamMemberRole): boolean => {
  return role === 'owner' || role === 'admin';
};

/**
 * Check if user can delete resources
 */
export const canDelete = (role: TeamMemberRole, resource: PermissionResource): boolean => {
  if (role === 'owner') return true;
  if (role === 'admin' && resource !== 'team') return true;
  return false;
};

/**
 * Check if user can create/update resources
 */
export const canModify = (role: TeamMemberRole, resource: PermissionResource): boolean => {
  if (role === 'owner' || role === 'admin') return true;
  if (role === 'editor' && (resource === 'leads' || resource === 'documents')) return true;
  return false;
};
