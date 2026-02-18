/**
 * Helper functions for building Firestore queries with teamId support
 */
import { where, or } from 'firebase/firestore';

/**
 * Build query constraints for filtering by teamId or userId
 * Prioritizes teamId if available, falls back to userId for backward compatibility
 */
export const buildTeamQuery = (teamId: string | null | undefined, userId: string) => {
  // If teamId is available, use it; otherwise fall back to userId
  if (teamId) {
    return [where('teamId', '==', teamId)];
  } else {
    // For backward compatibility, filter by userId
    // In the future, we might want to require teamId
    return [where('userId', '==', userId)];
  }
};

/**
 * Build query constraints that filter by teamId OR userId (for migration period)
 * This allows finding documents that belong to either the team or the user
 */
export const buildTeamOrUserQuery = (teamId: string | null | undefined, userId: string) => {
  if (teamId) {
    // Filter by teamId OR userId (for documents that haven't been migrated yet)
    return [
      or(
        where('teamId', '==', teamId),
        where('userId', '==', userId)
      )
    ];
  } else {
    return [where('userId', '==', userId)];
  }
};
