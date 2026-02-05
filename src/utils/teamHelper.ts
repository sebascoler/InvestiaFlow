/**
 * Helper functions for team-related operations
 */

import { useTeam } from '../contexts/TeamContext';

/**
 * Get the current team ID from TeamContext
 * This hook should be used in components that have access to TeamContext
 */
export const useCurrentTeamId = (): string | null => {
  const { currentTeam } = useTeam();
  return currentTeam?.id || null;
};

/**
 * Get team ID for a service call
 * Returns teamId if available, otherwise falls back to userId for backward compatibility
 */
export const getTeamIdForQuery = (teamId: string | null | undefined, userId: string): string | null => {
  return teamId || null; // For now, return teamId if available
  // In the future, we might want to always require teamId
};
