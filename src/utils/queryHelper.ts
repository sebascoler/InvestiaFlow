/**
 * Helper functions for building Firestore queries with teamId support
 */

/**
 * Build query constraints for filtering by teamId or userId
 * Prioritizes teamId if available, falls back to userId for backward compatibility
 */
export const buildTeamQuery = (teamId: string | null | undefined, userId: string) => {
  const firebaseFirestore = require('firebase/firestore');
  const whereFunc = firebaseFirestore.where;
  
  // If teamId is available, use it; otherwise fall back to userId
  if (teamId) {
    return [whereFunc('teamId', '==', teamId)];
  } else {
    // For backward compatibility, filter by userId
    // In the future, we might want to require teamId
    return [whereFunc('userId', '==', userId)];
  }
};

/**
 * Build query constraints that filter by teamId OR userId (for migration period)
 * This allows finding documents that belong to either the team or the user
 */
export const buildTeamOrUserQuery = (teamId: string | null | undefined, userId: string) => {
  const firebaseFirestore = require('firebase/firestore');
  const whereFunc = firebaseFirestore.where;
  const orFunc = firebaseFirestore.or;
  
  if (teamId) {
    // Filter by teamId OR userId (for documents that haven't been migrated yet)
    return [
      orFunc(
        whereFunc('teamId', '==', teamId),
        whereFunc('userId', '==', userId)
      )
    ];
  } else {
    return [whereFunc('userId', '==', userId)];
  }
};
