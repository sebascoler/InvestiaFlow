export type TeamMemberRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type TeamMemberStatus = 'pending' | 'active';

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: TeamSettings;
}

export interface TeamSettings {
  allowMemberInvites?: boolean;
  defaultRole?: TeamMemberRole;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  email: string;
  name: string;
  role: TeamMemberRole;
  invitedBy: string;
  joinedAt: Date;
  status: TeamMemberStatus;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamMemberRole;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
}
