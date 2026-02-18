// Team Service - Mock implementation
import { Team, TeamMember, TeamInvitation, TeamMemberRole, TeamSettings } from '../types/team';

const teamsDB: Team[] = [];
const teamMembersDB: TeamMember[] = [];
const teamInvitationsDB: TeamInvitation[] = [];

// ── localStorage helpers for mock team persistence across reloads ──

const TEAM_STORAGE_KEY = 'investiaflow_mock_team';
const MEMBER_STORAGE_KEY = 'investiaflow_mock_member';

function persistTeamToStorage(team: Team): void {
  try {
    localStorage.setItem(`${TEAM_STORAGE_KEY}_${team.ownerId}`, JSON.stringify(team));
  } catch { /* localStorage unavailable */ }
}

function loadTeamFromStorage(userId: string): Team | null {
  try {
    const raw = localStorage.getItem(`${TEAM_STORAGE_KEY}_${userId}`);
    if (!raw) return null;
    const team = JSON.parse(raw);
    // Restore Date objects
    if (team.createdAt) team.createdAt = new Date(team.createdAt);
    if (team.updatedAt) team.updatedAt = new Date(team.updatedAt);
    return team;
  } catch { return null; }
}

function persistMemberToStorage(member: TeamMember): void {
  try {
    localStorage.setItem(`${MEMBER_STORAGE_KEY}_${member.userId}`, JSON.stringify(member));
  } catch { /* localStorage unavailable */ }
}

function loadMemberFromStorage(userId: string): TeamMember | null {
  try {
    const raw = localStorage.getItem(`${MEMBER_STORAGE_KEY}_${userId}`);
    if (!raw) return null;
    const member = JSON.parse(raw);
    if (member.joinedAt) member.joinedAt = new Date(member.joinedAt);
    return member;
  } catch { return null; }
}

/** Ensure a persisted team is loaded into the in-memory arrays */
function restoreTeamIfNeeded(userId: string): void {
  // Already in memory?
  const existingMember = teamMembersDB.find(m => m.userId === userId && m.status === 'active');
  if (existingMember && teamsDB.find(t => t.id === existingMember.teamId)) return;

  // Try localStorage
  const storedTeam = loadTeamFromStorage(userId);
  if (!storedTeam) return;

  if (!teamsDB.find(t => t.id === storedTeam.id)) {
    teamsDB.push(storedTeam);
  }

  const storedMember = loadMemberFromStorage(userId);
  if (storedMember && !teamMembersDB.find(m => m.userId === userId && m.teamId === storedTeam.id)) {
    teamMembersDB.push(storedMember);
  }
}

export const teamServiceMock = {
  async createTeam(userId: string, name: string): Promise<Team> {
    // Use a deterministic ID so it's stable across page reloads
    const teamId = `team-mock-${userId}`;

    // If this team already exists (restored from storage), return it
    const existing = teamsDB.find(t => t.id === teamId);
    if (existing) return { ...existing };

    const now = new Date();
    const team: Team = {
      id: teamId,
      name,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    };

    teamsDB.push(team);
    persistTeamToStorage(team);

    // Auto-add owner as member
    const ownerMember: TeamMember = {
      id: `member-mock-${userId}`,
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
    persistMemberToStorage(ownerMember);

    return { ...team };
  },

  async getTeam(teamId: string): Promise<Team | null> {
    const team = teamsDB.find(t => t.id === teamId);
    return team ? { ...team } : null;
  },

  async getUserTeams(userId: string): Promise<Team[]> {
    // Restore from localStorage if the in-memory arrays are empty
    restoreTeamIfNeeded(userId);

    const memberTeamIds = teamMembersDB
      .filter(m => m.userId === userId && m.status === 'active')
      .map(m => m.teamId);

    return teamsDB
      .filter(t => memberTeamIds.includes(t.id))
      .map(t => ({ ...t }));
  },

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const members = teamMembersDB
      .filter(m => m.teamId === teamId)
      .map(m => ({ ...m }));
    
    // Remove duplicates by userId (keep the most recent one)
    const membersMap = new Map<string, TeamMember>();
    members.forEach(member => {
      const existing = membersMap.get(member.userId);
      if (!existing || member.joinedAt > existing.joinedAt) {
        membersMap.set(member.userId, member);
      }
    });
    
    return Array.from(membersMap.values());
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

  async getPendingInvitations(teamId: string): Promise<TeamInvitation[]> {
    const now = new Date();
    return teamInvitationsDB
      .filter(inv => inv.teamId === teamId && !inv.acceptedAt && inv.expiresAt > now)
      .map(inv => ({ ...inv }));
  },

  async updateBranding(teamId: string, branding: Partial<import('../types/team').TeamBranding>): Promise<Team> {
    const team = teamsDB.find(t => t.id === teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    team.branding = {
      ...team.branding,
      ...branding,
    };
    team.updatedAt = new Date();
    persistTeamToStorage(team);

    return { ...team };
  },

  async updateSettings(teamId: string, settings: Partial<TeamSettings>): Promise<Team> {
    const team = teamsDB.find(t => t.id === teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    team.settings = {
      ...team.settings,
      ...settings,
    };
    team.updatedAt = new Date();
    persistTeamToStorage(team);

    return { ...team };
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

  async getPendingInvitations(teamId: string): Promise<TeamInvitation[]> {
    const service = await getFirebaseService();
    return service 
      ? service.getPendingInvitations(teamId) 
      : teamServiceMock.getPendingInvitations(teamId);
  },

  async updateBranding(teamId: string, branding: Partial<import('../types/team').TeamBranding>): Promise<Team> {
    const service = await getFirebaseService();
    return service
      ? service.updateBranding(teamId, branding)
      : teamServiceMock.updateBranding(teamId, branding);
  },

  async updateSettings(teamId: string, settings: Partial<TeamSettings>): Promise<Team> {
    const service = await getFirebaseService();
    return service
      ? service.updateSettings(teamId, settings)
      : teamServiceMock.updateSettings(teamId, settings);
  },
};
