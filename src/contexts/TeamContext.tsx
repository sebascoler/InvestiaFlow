import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, TeamMember } from '../types/team';
import { useAuth } from './AuthContext';
import { teamService } from '../services/teamService';

interface TeamContextType {
  currentTeam: Team | null;
  teams: Team[];
  members: TeamMember[];
  loading: boolean;
  error: string | null;
  setCurrentTeam: (team: Team | null) => void;
  refreshTeams: () => Promise<void>;
  refreshMembers: () => Promise<void>;
  createTeam: (name: string) => Promise<Team>;
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
      
      // If no current team is set and user has teams, set the first one
      if (!currentTeam && userTeams.length > 0) {
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

  // Load teams when user changes
  useEffect(() => {
    refreshTeams();
  }, [user]);

  // Load members when current team changes
  useEffect(() => {
    refreshMembers();
  }, [currentTeam]);

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        teams,
        members,
        loading,
        error,
        setCurrentTeam,
        refreshTeams,
        refreshMembers,
        createTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};
