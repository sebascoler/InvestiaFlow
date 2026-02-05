import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Crown, Shield, Edit, Eye, Trash2, Check, X, Palette, Upload, Image as ImageIcon } from 'lucide-react';
import { useTeam } from '../contexts/TeamContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Modal } from '../components/shared/Modal';
import { Select } from '../components/shared/Select';
import { ToastContainer, ToastType } from '../components/shared/Toast';
import { ColorPicker } from '../components/shared/ColorPicker';
import { teamService } from '../services/teamService';
import { invitationService } from '../services/invitationService';
import { TeamMemberRole, TeamBranding } from '../types/team';
import { PermissionGate, usePermission } from '../components/shared/PermissionGate';
import { storageService } from '../firebase/storage';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const TeamPage: React.FC = () => {
  const { currentTeam, teams, members, pendingInvitations, loading, error, refreshMembers, refreshInvitations, createTeam, updateBranding } = useTeam();
  const { user } = useAuth();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMemberRole>('viewer');
  const [newTeamName, setNewTeamName] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isUpdatingBranding, setIsUpdatingBranding] = useState(false);
  
  // Branding state
  const [branding, setBranding] = useState<Partial<TeamBranding>>({
    primaryColor: '#0284c7',
    secondaryColor: '#0ea5e9',
    accentColor: '#06b6d4',
    companyName: '',
    theme: 'light',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const canManageMembers = usePermission('manage_members', 'members');
  const isOwner = currentTeam?.ownerId === user?.id;

  // Initialize branding from current team
  useEffect(() => {
    if (currentTeam?.branding) {
      setBranding({
        primaryColor: currentTeam.branding.primaryColor || '#0284c7',
        secondaryColor: currentTeam.branding.secondaryColor || '#0ea5e9',
        accentColor: currentTeam.branding.accentColor || '#06b6d4',
        companyName: currentTeam.branding.companyName || '',
        theme: currentTeam.branding.theme || 'light',
      });
      setLogoPreview(currentTeam.branding.logoUrl || null);
    } else {
      setBranding({
        primaryColor: '#0284c7',
        secondaryColor: '#0ea5e9',
        accentColor: '#06b6d4',
        companyName: '',
        theme: 'light',
      });
      setLogoPreview(null);
    }
  }, [currentTeam?.branding]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleInviteMember = async () => {
    if (!currentTeam || !user) {
      addToast('No team selected', 'error');
      return;
    }

    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }

    setIsInviting(true);
    try {
      const invitation = await teamService.inviteMember(
        currentTeam.id,
        inviteEmail.trim(),
        inviteRole,
        user.id
      );

      // Send invitation email via Cloud Function
      try {
        const { getFunctions, httpsCallable } = await import('firebase/functions');
        const { getFirebaseApp, isFirebaseReady } = await import('../firebase/config');
        
        if (isFirebaseReady()) {
          const app = getFirebaseApp();
          if (app) {
            // Specify region explicitly to match deployed function
            const functions = getFunctions(app, 'us-central1');
            const sendInvitationEmail = httpsCallable(functions, 'sendTeamInvitationEmail');
            
            // Get the current app URL (for local dev or production)
            const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
            
            await sendInvitationEmail({
              invitationId: invitation.id,
              teamName: currentTeam.name,
              inviterName: user.name,
              appUrl: appUrl, // Pass the app URL from frontend
            });
          }
        }
      } catch (emailError: any) {
        console.error('Failed to send invitation email:', emailError);
        // Log more details for debugging
        if (emailError.code) {
          console.error('Error code:', emailError.code);
        }
        if (emailError.message) {
          console.error('Error message:', emailError.message);
        }
        // Don't fail the whole operation if email fails
        addToast('Invitation created but email failed to send. Please try again.', 'warning');
      }

      addToast(`Invitation sent to ${inviteEmail}`, 'success');
      setInviteEmail('');
      setIsInviteModalOpen(false);
      await refreshInvitations(); // Refresh invitations list
    } catch (err: any) {
      addToast(err.message || 'Failed to send invitation', 'error');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!user) {
      addToast('User not authenticated', 'error');
      return;
    }

    if (!newTeamName.trim()) {
      addToast('Please enter a team name', 'error');
      return;
    }

    setIsCreatingTeam(true);
    try {
      await createTeam(newTeamName.trim());
      addToast('Team created successfully', 'success');
      setNewTeamName('');
      setIsCreateTeamModalOpen(false);
    } catch (err: any) {
      addToast(err.message || 'Failed to create team', 'error');
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: TeamMemberRole) => {
    if (!currentTeam) return;

    try {
      await teamService.updateMemberRole(currentTeam.id, memberId, newRole);
      addToast('Member role updated', 'success');
      await refreshMembers();
      await refreshInvitations();
    } catch (err: any) {
      addToast(err.message || 'Failed to update role', 'error');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentTeam) return;

    const member = members.find(m => m.id === memberId);
    if (!member) return;

    if (member.role === 'owner') {
      addToast('Cannot remove team owner', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${member.name || member.email} from the team?`)) {
      return;
    }

    try {
      await teamService.removeMember(currentTeam.id, memberId);
      addToast('Member removed', 'success');
      await refreshMembers();
      await refreshInvitations();
    } catch (err: any) {
      addToast(err.message || 'Failed to remove member', 'error');
    }
  };

  const getRoleIcon = (role: TeamMemberRole) => {
    switch (role) {
      case 'owner':
        return <Crown size={16} className="text-yellow-500" />;
      case 'admin':
        return <Shield size={16} className="text-blue-500" />;
      case 'editor':
        return <Edit size={16} className="text-green-500" />;
      case 'viewer':
        return <Eye size={16} className="text-gray-500" />;
    }
  };

  const getRoleLabel = (role: TeamMemberRole) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Viewer';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If no teams exist, show create team option
  if (teams.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Teams Yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first team to start collaborating with your colleagues.
          </p>
          <Button variant="primary" onClick={() => setIsCreateTeamModalOpen(true)}>
            <UserPlus size={20} className="mr-2" />
            Create Team
          </Button>
        </div>

        <Modal
          isOpen={isCreateTeamModalOpen}
          onClose={() => setIsCreateTeamModalOpen(false)}
          title="Create Team"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name
              </label>
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsCreateTeamModalOpen(false)}
                disabled={isCreatingTeam}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateTeam}
                isLoading={isCreatingTeam}
                disabled={isCreatingTeam}
              >
                Create Team
              </Button>
            </div>
          </div>
        </Modal>

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        addToast('Please select an image file', 'error');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        addToast('Image size must be less than 2MB', 'error');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = async () => {
    if (!currentTeam || !user) {
      addToast('No team selected', 'error');
      return;
    }

    // Verify user has permission (owner or admin)
    if (currentTeam.ownerId !== user.id && !canManageMembers) {
      addToast('You do not have permission to update branding', 'error');
      return;
    }

    setIsUpdatingBranding(true);
    try {
      let logoUrl = branding.logoUrl;
      
      // Upload logo if a new file was selected
      if (logoFile) {
        const storagePath = `teams/${currentTeam.id}/logo/${Date.now()}-${logoFile.name}`;
        const { url } = await storageService.uploadFile(storagePath, logoFile);
        logoUrl = url;
      }
      
      // Build updated branding, removing undefined values
      const updatedBranding: Partial<TeamBranding> = {};
      
      if (logoUrl) {
        updatedBranding.logoUrl = logoUrl;
      } else if (branding.logoUrl) {
        updatedBranding.logoUrl = branding.logoUrl;
      }
      
      if (branding.primaryColor) {
        updatedBranding.primaryColor = branding.primaryColor;
      }
      
      if (branding.secondaryColor) {
        updatedBranding.secondaryColor = branding.secondaryColor;
      }
      
      if (branding.accentColor) {
        updatedBranding.accentColor = branding.accentColor;
      }
      
      if (branding.companyName) {
        updatedBranding.companyName = branding.companyName;
      }
      
      if (branding.theme) {
        updatedBranding.theme = branding.theme;
      }
      
      await updateBranding(currentTeam.id, updatedBranding);
      addToast('Branding updated successfully', 'success');
      setIsBrandingModalOpen(false);
      setLogoFile(null);
    } catch (err: any) {
      addToast(err.message || 'Failed to update branding', 'error');
    } finally {
      setIsUpdatingBranding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2">
              {currentTeam ? `Managing: ${currentTeam.name}` : 'Select a team to manage'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(isOwner || canManageMembers) && (
              <Button 
                variant="secondary" 
                onClick={() => setIsBrandingModalOpen(true)}
              >
                <Palette size={20} className="mr-2" />
                Branding
              </Button>
            )}
            <PermissionGate action="manage_members" resource="members">
              <Button variant="primary" onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus size={20} className="mr-2" />
                Invite Member
              </Button>
            </PermissionGate>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {currentTeam && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Team Members</h2>
            <p className="text-sm text-gray-600">
              {members.length} active member{members.length !== 1 ? 's' : ''}
              {pendingInvitations.length > 0 && (
                <span className="ml-2">
                  • {pendingInvitations.length} pending invitation{pendingInvitations.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Active Members */}
            {members.map((member) => {
              const isCurrentUser = member.userId === user?.id;
              const isMemberOwner = member.role === 'owner';

              return (
                <div
                  key={member.id}
                  className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Users size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {member.name || member.email}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-gray-500">(You)</span>
                          )}
                        </h3>
                        {getRoleIcon(member.role)}
                        <span className="text-sm text-gray-600">
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{member.email}</p>
                    </div>
                  </div>

                  {/* Show management options for owner or admin, but not for the member being viewed if they're owner */}
                  {(isOwner || canManageMembers) && !isMemberOwner && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role}
                        onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as TeamMemberRole)}
                        options={[
                          { value: 'viewer', label: 'Viewer' },
                          { value: 'editor', label: 'Editor' },
                          { value: 'admin', label: 'Admin' },
                        ]}
                        className="w-32"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pending Invitations */}
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors bg-yellow-50/30"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Mail size={20} className="text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {invitation.email}
                      </h3>
                      {getRoleIcon(invitation.role)}
                      <span className="text-sm text-gray-600">
                        {getRoleLabel(invitation.role)}
                      </span>
                      <span className="inline-block text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        Invited
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Invitation sent {new Date(invitation.createdAt).toLocaleDateString()}
                      {invitation.expiresAt && (
                        <span className="ml-2">
                          • Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {(isOwner || canManageMembers) && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={invitation.role}
                      onChange={(e) => {
                        // Update invitation role (would need a new method)
                        // For now, just show the role
                      }}
                      disabled
                      options={[
                        { value: 'viewer', label: 'Viewer' },
                        { value: 'editor', label: 'Editor' },
                        { value: 'admin', label: 'Admin' },
                      ]}
                      className="w-32 opacity-60"
                    />
                    <span className="text-xs text-gray-500 italic">Pending</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteEmail('');
        }}
        title="Invite Team Member"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <Select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TeamMemberRole)}
              options={[
                { value: 'viewer', label: 'Viewer - Read only access' },
                { value: 'editor', label: 'Editor - Can create and edit' },
                { value: 'admin', label: 'Admin - Full access except team deletion' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsInviteModalOpen(false);
                setInviteEmail('');
              }}
              disabled={isInviting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleInviteMember}
              isLoading={isInviting}
              disabled={isInviting}
            >
              <Mail size={16} className="mr-2" />
              Send Invitation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Branding Configuration Modal */}
      <Modal
        isOpen={isBrandingModalOpen}
        onClose={() => {
          setIsBrandingModalOpen(false);
          setLogoFile(null);
        }}
        title="Team Branding"
      >
        <div className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-20 w-20 object-contain border-2 border-gray-200 rounded-lg p-2 bg-white"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <Input
              label="Company Name"
              value={branding.companyName || ''}
              onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
              placeholder="Your Company Name"
              helpText="Used in emails and branding"
            />
          </div>

          {/* Color Pickers */}
          <ColorPicker
            label="Primary Color"
            value={branding.primaryColor || '#0284c7'}
            onChange={(color) => setBranding({ ...branding, primaryColor: color })}
          />

          <ColorPicker
            label="Secondary Color"
            value={branding.secondaryColor || '#0ea5e9'}
            onChange={(color) => setBranding({ ...branding, secondaryColor: color })}
          />

          <ColorPicker
            label="Accent Color"
            value={branding.accentColor || '#06b6d4'}
            onChange={(color) => setBranding({ ...branding, accentColor: color })}
          />

          {/* Theme Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <Select
              value={branding.theme || 'light'}
              onChange={(e) => setBranding({ ...branding, theme: e.target.value as 'light' | 'dark' | 'auto' })}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto (System)' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsBrandingModalOpen(false);
                setLogoFile(null);
              }}
              disabled={isUpdatingBranding}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveBranding}
              isLoading={isUpdatingBranding}
              disabled={isUpdatingBranding}
            >
              Save Branding
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default TeamPage;
