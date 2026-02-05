import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, TeamMember } from '../types/team';
import { useAuth } from './AuthContext';
import { teamService } from '../services/teamService';

import { TeamInvitation } from '../types/team';

interface TeamContextType {
  currentTeam: Team | null;
  teams: Team[];
  members: TeamMember[];
  pendingInvitations: TeamInvitation[];
  loading: boolean;
  error: string | null;
  setCurrentTeam: (team: Team | null) => void;
  refreshTeams: () => Promise<void>;
  refreshMembers: () => Promise<void>;
  refreshInvitations: () => Promise<void>;
  createTeam: (name: string) => Promise<Team>;
  updateBranding: (teamId: string, branding: Partial<import('../types/team').TeamBranding>) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTeams = async () => {
    if (!user) {
      setTeams([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userTeams = await teamService.getUserTeams(user.id);
      setTeams(userTeams);
      
      // If user has no teams, create one automatically
      if (userTeams.length === 0) {
        try {
          const defaultTeamName = `${user.name}'s Team`;
          const newTeam = await teamService.createTeam(user.id, defaultTeamName);
          setTeams([newTeam]);
          setCurrentTeam(newTeam);
        } catch (createError) {
          console.error('Failed to auto-create team:', createError);
          // Don't set error - user can create team manually
        }
      } else if (!currentTeam) {
        // If no current team is set and user has teams, set the first one
        setCurrentTeam(userTeams[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const refreshMembers = async () => {
    if (!currentTeam) {
      setMembers([]);
      return;
    }

    try {
      const teamMembers = await teamService.getTeamMembers(currentTeam.id);
      setMembers(teamMembers);
    } catch (err) {
      console.error('Error loading team members:', err);
    }
  };

  const refreshInvitations = async () => {
    if (!currentTeam) {
      setPendingInvitations([]);
      return;
    }

    try {
      const invitations = await teamService.getPendingInvitations(currentTeam.id);
      setPendingInvitations(invitations);
    } catch (err) {
      console.error('Error loading pending invitations:', err);
    }
  };

  const createTeam = async (name: string): Promise<Team> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const newTeam = await teamService.createTeam(user.id, name);
      await refreshTeams();
      setCurrentTeam(newTeam);
      return newTeam;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create team';
      setError(errorMessage);
      throw err;
    }
  };

  const updateBranding = async (teamId: string, branding: Partial<import('../types/team').TeamBranding>): Promise<void> => {
    try {
      setError(null);
      await teamService.updateBranding(teamId, branding);
      await refreshTeams();
      // Update currentTeam if it's the one being updated
      if (currentTeam?.id === teamId) {
        const updatedTeam = await teamService.getTeam(teamId);
        if (updatedTeam) {
          setCurrentTeam(updatedTeam);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update branding';
      setError(errorMessage);
      throw err;
    }
  };

  // Load teams when user changes
  useEffect(() => {
    refreshTeams();
  }, [user]);

  // Load members and invitations when current team changes
  useEffect(() => {
    refreshMembers();
    refreshInvitations();
  }, [currentTeam]);

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        teams,
        members,
        pendingInvitations,
        loading,
        error,
        setCurrentTeam,
        refreshTeams,
        refreshMembers,
        refreshInvitations,
        createTeam,
        updateBranding,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};
