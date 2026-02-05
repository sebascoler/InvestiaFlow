// Team Service - Mock implementation
import { Team, TeamMember, TeamInvitation, TeamMemberRole } from '../types/team';

const teamsDB: Team[] = [];
const teamMembersDB: TeamMember[] = [];
const teamInvitationsDB: TeamInvitation[] = [];

export const teamServiceMock = {
  async createTeam(userId: string, name: string): Promise<Team> {
    const now = new Date();
    const team: Team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    };
    
    teamsDB.push(team);
    
    // Auto-add owner as member
    const ownerMember: TeamMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teamId: team.id,
      userId,
      email: 'owner@example.com',
      name: 'Owner',
      role: 'owner',
      invitedBy: userId,
      joinedAt: now,
      status: 'active',
    };
    teamMembersDB.push(ownerMember);
    
    return { ...team };
  },

  async getTeam(teamId: string): Promise<Team | null> {
    const team = teamsDB.find(t => t.id === teamId);
    return team ? { ...team } : null;
  },

  async getUserTeams(userId: string): Promise<Team[]> {
    const memberTeamIds = teamMembersDB
      .filter(m => m.userId === userId && m.status === 'active')
      .map(m => m.teamId);
    
    return teamsDB
      .filter(t => memberTeamIds.includes(t.id))
      .map(t => ({ ...t }));
  },

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return teamMembersDB
      .filter(m => m.teamId === teamId)
      .map(m => ({ ...m }));
  },

  async inviteMember(teamId: string, email: string, role: TeamMemberRole, invitedBy: string): Promise<TeamInvitation> {
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
    
    teamInvitationsDB.push(invitation);
    return { ...invitation };
  },

  async updateMemberRole(teamId: string, memberId: string, role: TeamMemberRole): Promise<TeamMember> {
    const index = teamMembersDB.findIndex(m => m.id === memberId && m.teamId === teamId);
    if (index === -1) {
      throw new Error('Member not found');
    }
    
    teamMembersDB[index].role = role;
    return { ...teamMembersDB[index] };
  },

  async removeMember(teamId: string, memberId: string): Promise<void> {
    const index = teamMembersDB.findIndex(m => m.id === memberId && m.teamId === teamId);
    if (index === -1) {
      throw new Error('Member not found');
    }
    
    teamMembersDB.splice(index, 1);
  },
};

// Try to load Firebase service
const getFirebaseService = async () => {
  try {
    const { isFirebaseReady } = await import('../firebase/config');
    if (isFirebaseReady()) {
      const { teamServiceFirebase } = await import('./teamService.firebase');
      return teamServiceFirebase;
    }
    return null;
  } catch (error) {
    console.warn('Firebase service not available, using mock:', error);
    return null;
  }
};

// Export service that uses Firebase if available, otherwise mock
export const teamService = {
  async createTeam(userId: string, name: string): Promise<Team> {
    const service = await getFirebaseService();
    return service 
      ? service.createTeam(userId, name) 
      : teamServiceMock.createTeam(userId, name);
  },

  async getTeam(teamId: string): Promise<Team | null> {
    const service = await getFirebaseService();
    return service 
      ? service.getTeam(teamId) 
      : teamServiceMock.getTeam(teamId);
  },

  async getUserTeams(userId: string): Promise<Team[]> {
    const service = await getFirebaseService();
    return service 
      ? service.getUserTeams(userId) 
      : teamServiceMock.getUserTeams(userId);
  },

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const service = await getFirebaseService();
    return service 
      ? service.getTeamMembers(teamId) 
      : teamServiceMock.getTeamMembers(teamId);
  },

  async inviteMember(teamId: string, email: string, role: TeamMemberRole, invitedBy: string): Promise<TeamInvitation> {
    const service = await getFirebaseService();
    return service 
      ? service.inviteMember(teamId, email, role, invitedBy) 
      : teamServiceMock.inviteMember(teamId, email, role, invitedBy);
  },

  async updateMemberRole(teamId: string, memberId: string, role: TeamMemberRole): Promise<TeamMember> {
    const service = await getFirebaseService();
    return service 
      ? service.updateMemberRole(teamId, memberId, role) 
      : teamServiceMock.updateMemberRole(teamId, memberId, role);
  },

  async removeMember(teamId: string, memberId: string): Promise<void> {
    const service = await getFirebaseService();
    return service 
      ? service.removeMember(teamId, memberId) 
      : teamServiceMock.removeMember(teamId, memberId);
  },
};
