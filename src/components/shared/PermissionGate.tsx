import React, { ReactNode } from 'react';
import { useTeam } from '../../contexts/TeamContext';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionAction, PermissionResource, canUser } from '../../utils/permissions';

interface PermissionGateProps {
  action: PermissionAction;
  resource: PermissionResource;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component that renders children only if user has permission
 * Otherwise renders fallback (or nothing)
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  action,
  resource,
  fallback = null,
  children,
}) => {
  const { user } = useAuth();
  const { currentTeam, members } = useTeam();

  // If no team, allow access (backward compatibility)
  // Exception: allow creating team if no teams exist
  if (!currentTeam) {
    if (action === 'manage_team' && resource === 'team') {
      // Allow creating first team
      return <>{children}</>;
    }
    // For other actions without team, allow (backward compatibility)
    return <>{children}</>;
  }

  // Find user's role in the team
  const userMember = members.find(m => m.userId === user?.id);
  const role = userMember?.role || 'viewer';

  // Check permission
  const hasPermission = canUser(action, resource, role);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Hook to check if current user has permission
 */
export const usePermission = (action: PermissionAction, resource: PermissionResource): boolean => {
  const { user } = useAuth();
  const { currentTeam, members } = useTeam();

  if (!user) {
    return false;
  }

  // If no team, allow creating team
  if (!currentTeam) {
    if (action === 'manage_team' && resource === 'team') {
      return true; // Allow creating first team
    }
    // For other actions without team, allow (backward compatibility)
    return true;
  }

  const userMember = members.find(m => m.userId === user.id);
  const role = userMember?.role || 'viewer';

  return canUser(action, resource, role);
};
