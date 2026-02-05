// Invitation Service - Uses Firebase if available, otherwise mock
import { TeamInvitation } from '../types/team';
import { firestoreService, timestampToDate, dateToTimestamp } from '../firebase/firestore';

const TEAM_INVITATIONS_COLLECTION = 'teamInvitations';

// Mock storage
const invitationsDB: TeamInvitation[] = [];

export const invitationServiceMock = {
  async getInvitationByToken(token: string): Promise<TeamInvitation | null> {
    const invitation = invitationsDB.find(
      inv => inv.token === token && inv.expiresAt > new Date() && !inv.acceptedAt
    );
    return invitation ? { ...invitation } : null;
  },

  async acceptInvitation(token: string, userId: string, userEmail: string, userName: string): Promise<void> {
    const invitation = invitationsDB.find(inv => inv.token === token);
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    
    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }
    
    if (invitation.acceptedAt) {
      throw new Error('Invitation already accepted');
    }
    
    // Mark as accepted
    invitation.acceptedAt = new Date();
    
    // In real implementation, this would create a TeamMember
    // For now, just mark as accepted
  },
};

// Helper to convert Firestore data to TeamInvitation
const firestoreToInvitation = (data: any): TeamInvitation => {
  return {
    ...data,
    expiresAt: timestampToDate(data.expiresAt) || new Date(),
    createdAt: timestampToDate(data.createdAt) || new Date(),
    acceptedAt: data.acceptedAt ? timestampToDate(data.acceptedAt) : undefined,
  } as TeamInvitation;
};

export const invitationServiceFirebase = {
  async getInvitationByToken(token: string): Promise<TeamInvitation | null> {
    try {
      const firebaseFirestore = await import('firebase/firestore');
      const whereFunc = firebaseFirestore.where;
      
      const invitations = await firestoreService.getDocs<TeamInvitation>(
        TEAM_INVITATIONS_COLLECTION,
        [whereFunc('token', '==', token)]
      );
      
      if (invitations.length === 0) {
        return null;
      }
      
      const invitation = firestoreToInvitation(invitations[0]);
      
      // Check if expired or already accepted
      if (invitation.expiresAt < new Date() || invitation.acceptedAt) {
        return null;
      }
      
      return invitation;
    } catch (error) {
      console.error('[invitationServiceFirebase] Error getting invitation:', error);
      throw error;
    }
  },

  async acceptInvitation(token: string, userId: string, userEmail: string, userName: string): Promise<void> {
    try {
      const invitation = await this.getInvitationByToken(token);
      
      if (!invitation) {
        throw new Error('Invitation not found or invalid');
      }
      
      // Mark invitation as accepted
      await firestoreService.updateDoc(TEAM_INVITATIONS_COLLECTION, invitation.id, {
        acceptedAt: dateToTimestamp(new Date()),
      });
      
      // Create team member
      const { teamService } = await import('./teamService');
      const now = new Date();
      const memberId = `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const memberData = {
        id: memberId,
        teamId: invitation.teamId,
        userId,
        email: userEmail,
        name: userName,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
        joinedAt: dateToTimestamp(now),
        status: 'active' as const,
      };
      
      await firestoreService.setDoc('teamMembers', memberId, memberData);
    } catch (error) {
      console.error('[invitationServiceFirebase] Error accepting invitation:', error);
      throw error;
    }
  },
};

// Try to load Firebase service
const getFirebaseService = async () => {
  try {
    const { isFirebaseReady } = await import('../firebase/config');
    if (isFirebaseReady()) {
      return invitationServiceFirebase;
    }
    return null;
  } catch (error) {
    console.warn('Firebase service not available, using mock:', error);
    return null;
  }
};

// Export service that uses Firebase if available, otherwise mock
export const invitationService = {
  async getInvitationByToken(token: string): Promise<TeamInvitation | null> {
    const service = await getFirebaseService();
    return service 
      ? service.getInvitationByToken(token) 
      : invitationServiceMock.getInvitationByToken(token);
  },

  async acceptInvitation(token: string, userId: string, userEmail: string, userName: string): Promise<void> {
    const service = await getFirebaseService();
    return service 
      ? service.acceptInvitation(token, userId, userEmail, userName) 
      : invitationServiceMock.acceptInvitation(token, userId, userEmail, userName);
  },
};
