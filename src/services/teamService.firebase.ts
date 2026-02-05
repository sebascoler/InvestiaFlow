// Firebase implementation of teamService
import { Team, TeamMember, TeamInvitation, TeamMemberRole } from '../types/team';
import { firestoreService, timestampToDate, dateToTimestamp } from '../firebase/firestore';

const TEAMS_COLLECTION = 'teams';
const TEAM_MEMBERS_COLLECTION = 'teamMembers';
const TEAM_INVITATIONS_COLLECTION = 'teamInvitations';

// Helper to convert Firestore data to Team
const firestoreToTeam = (data: any): Team => {
  return {
    ...data,
    createdAt: timestampToDate(data.createdAt) || new Date(),
    updatedAt: timestampToDate(data.updatedAt) || new Date(),
  } as Team;
};

// Helper to convert Firestore data to TeamMember
const firestoreToTeamMember = (data: any): TeamMember => {
  return {
    ...data,
    joinedAt: timestampToDate(data.joinedAt) || new Date(),
  } as TeamMember;
};

// Helper to convert Firestore data to TeamInvitation
const firestoreToTeamInvitation = (data: any): TeamInvitation => {
  return {
    ...data,
    expiresAt: timestampToDate(data.expiresAt) || new Date(),
    createdAt: timestampToDate(data.createdAt) || new Date(),
    acceptedAt: data.acceptedAt ? timestampToDate(data.acceptedAt) : undefined,
  } as TeamInvitation;
};

export const teamServiceFirebase = {
  async createTeam(userId: string, name: string): Promise<Team> {
    try {
      const now = new Date();
      const teamId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const team: Team = {
        id: teamId,
        name,
        ownerId: userId,
        createdAt: now,
        updatedAt: now,
      };
      
      const teamData = {
        ...team,
        createdAt: dateToTimestamp(now),
        updatedAt: dateToTimestamp(now),
      };
      
      await firestoreService.setDoc(TEAMS_COLLECTION, teamId, teamData);
      
      // Auto-add owner as member
      const memberId = `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const ownerMember: TeamMember = {
        id: memberId,
        teamId,
        userId,
        email: '', // Will be updated from user profile
        name: '', // Will be updated from user profile
        role: 'owner',
        invitedBy: userId,
        joinedAt: now,
        status: 'active',
      };
      
      const memberData = {
        ...ownerMember,
        joinedAt: dateToTimestamp(now),
      };
      
      await firestoreService.setDoc(TEAM_MEMBERS_COLLECTION, memberId, memberData);
      
      return team;
    } catch (error) {
      console.error('[teamServiceFirebase] Error creating team:', error);
      throw error;
    }
  },

  async getTeam(teamId: string): Promise<Team | null> {
    try {
      const team = await firestoreService.getDoc<Team>(TEAMS_COLLECTION, teamId);
      return team ? firestoreToTeam(team) : null;
    } catch (error) {
      console.error('[teamServiceFirebase] Error getting team:', error);
      throw error;
    }
  },

  async getUserTeams(userId: string): Promise<Team[]> {
    try {
      const firebaseFirestore = await import('firebase/firestore');
      const whereFunc = firebaseFirestore.where;
      
      // Get team members for this user
      const members = await firestoreService.getDocs<TeamMember>(
        TEAM_MEMBERS_COLLECTION,
        [
          whereFunc('userId', '==', userId),
          whereFunc('status', '==', 'active'),
        ]
      );
      
      if (members.length === 0) {
        return [];
      }
      
      // Get teams for these members
      const teamIds = members.map(m => m.teamId);
      const allTeams = await firestoreService.getDocs<Team>(TEAMS_COLLECTION);
      
      return allTeams
        .filter(t => teamIds.includes(t.id))
        .map(firestoreToTeam);
    } catch (error) {
      console.error('[teamServiceFirebase] Error getting user teams:', error);
      throw error;
    }
  },

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const firebaseFirestore = await import('firebase/firestore');
      const whereFunc = firebaseFirestore.where;
      
      const members = await firestoreService.getDocs<TeamMember>(
        TEAM_MEMBERS_COLLECTION,
        [whereFunc('teamId', '==', teamId)]
      );
      
      return members.map(firestoreToTeamMember);
    } catch (error) {
      console.error('[teamServiceFirebase] Error getting team members:', error);
      throw error;
    }
  },

  async inviteMember(teamId: string, email: string, role: TeamMemberRole, invitedBy: string): Promise<TeamInvitation> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const invitation: TeamInvitation = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        teamId,
        email,
        role,
        invitedBy,
        token: Math.random().toString(36).substr(2, 32),
        expiresAt,
        createdAt: now,
      };
      
      const invitationData = {
        ...invitation,
        expiresAt: dateToTimestamp(expiresAt),
        createdAt: dateToTimestamp(now),
      };
      
      await firestoreService.setDoc(TEAM_INVITATIONS_COLLECTION, invitation.id, invitationData);
      
      return invitation;
    } catch (error) {
      console.error('[teamServiceFirebase] Error inviting member:', error);
      throw error;
    }
  },

  async updateMemberRole(teamId: string, memberId: string, role: TeamMemberRole): Promise<TeamMember> {
    try {
      const member = await firestoreService.getDoc<TeamMember>(TEAM_MEMBERS_COLLECTION, memberId);
      
      if (!member || member.teamId !== teamId) {
        throw new Error('Member not found');
      }
      
      await firestoreService.updateDoc(TEAM_MEMBERS_COLLECTION, memberId, { role });
      
      return { ...member, role };
    } catch (error) {
      console.error('[teamServiceFirebase] Error updating member role:', error);
      throw error;
    }
  },

  async removeMember(teamId: string, memberId: string): Promise<void> {
    try {
      const member = await firestoreService.getDoc<TeamMember>(TEAM_MEMBERS_COLLECTION, memberId);
      
      if (!member || member.teamId !== teamId) {
        throw new Error('Member not found');
      }
      
      await firestoreService.deleteDoc(TEAM_MEMBERS_COLLECTION, memberId);
    } catch (error) {
      console.error('[teamServiceFirebase] Error removing member:', error);
      throw error;
    }
  },
};
