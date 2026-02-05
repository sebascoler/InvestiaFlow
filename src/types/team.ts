export type TeamMemberRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type TeamMemberStatus = 'pending' | 'active';

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: TeamSettings;
  branding?: TeamBranding;
}

export interface TeamSettings {
  allowMemberInvites?: boolean;
  defaultRole?: TeamMemberRole;
}

export interface TeamBranding {
  logoUrl?: string; // URL del logo (almacenado en Firebase Storage)
  primaryColor?: string; // Color primario (hex, ej: #0284c7)
  secondaryColor?: string; // Color secundario (hex)
  accentColor?: string; // Color de acento (hex)
  theme?: 'light' | 'dark' | 'auto'; // Tema de la aplicación
  companyName?: string; // Nombre de la empresa (para emails y branding)
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
