import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Info, Save, X, BookOpen, GitBranch } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { ToastContainer, ToastType } from '../components/shared/Toast';
import { useOnboarding } from '../hooks/useOnboarding';
import { userProfileService } from '../services/userProfileService';
import { StageManager } from '../components/settings/StageManager';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const SettingsPage: React.FC = () => {
  const { user, firebaseUser, updateProfile } = useAuth();
  const { unreadCount } = useNotifications();
  const { resetOnboarding } = useOnboarding();
  const [activeTab, setActiveTab] = useState<'profile' | 'pipeline' | 'preferences' | 'account'>('profile');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isResettingOnboarding, setIsResettingOnboarding] = useState(false);
  
  // Profile state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileCompany, setProfileCompany] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Load profile data when component mounts or user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const profile = await userProfileService.getProfile(user.id);
        if (profile) {
          setProfileName(profile.name);
          setProfileEmail(profile.email);
          setProfileCompany(profile.company || '');
          setProfilePhone(profile.phone || '');
        } else {
          // Use user data from auth context
          setProfileName(user.name);
          setProfileEmail(user.email);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to user data from auth context
        setProfileName(user.name);
        setProfileEmail(user.email);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);
  
  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

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

  const handleSaveProfile = async () => {
    if (!user) {
      addToast('User not authenticated', 'error');
      return;
    }

    // Validate fields
    if (!profileName.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    if (!profileEmail.trim() || !profileEmail.includes('@')) {
      addToast('Please enter a valid email', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updates: { name: string; company?: string; phone?: string; email?: string } = {
        name: profileName.trim(),
        company: profileCompany.trim() || undefined,
        phone: profilePhone.trim() || undefined,
      };
      
      // Only update email if not using Firebase Auth
      if (!firebaseUser) {
        updates.email = profileEmail.trim();
      }
      
      await updateProfile(updates);
      
      addToast('Profile updated successfully', 'success');
      setIsEditingProfile(false);
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      addToast(error instanceof Error ? error.message : 'Error updating profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePreferences = () => {
    // Save preferences to localStorage
    localStorage.setItem('investiaflow_preferences', JSON.stringify({
      emailNotifications,
      inAppNotifications,
      weeklyReports,
    }));
    addToast('Preferences saved', 'success');
  };

  const handleResetOnboarding = async () => {
    if (!window.confirm('Are you sure you want to reset the tutorials? They will show again the next time you enter each section.')) {
      return;
    }

    setIsResettingOnboarding(true);
    try {
      await resetOnboarding();
      addToast('Tutorials reset successfully', 'success');
    } catch (error: unknown) {
      addToast(error instanceof Error ? error.message : 'Error resetting tutorials', 'error');
    } finally {
      setIsResettingOnboarding(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'pipeline' as const, label: 'Pipeline', icon: GitBranch },
    { id: 'preferences' as const, label: 'Preferences', icon: Bell },
    { id: 'account' as const, label: 'Account', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile, preferences and account settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          
          {profileLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              {isEditingProfile ? (
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your name"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {profileName}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              {isEditingProfile ? (
                <Input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={!!firebaseUser}
                  className={firebaseUser ? 'bg-gray-100 cursor-not-allowed' : ''}
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {profileEmail}
                </div>
              )}
              {!!firebaseUser && (
                <p className="text-xs text-gray-500 mt-1">
                  Email is linked to your Firebase account and cannot be changed here. To change your email, update it in Firebase Auth settings.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company (optional)
              </label>
              {isEditingProfile ? (
                <Input
                  value={profileCompany}
                  onChange={(e) => setProfileCompany(e.target.value)}
                  placeholder="Your company name"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {profileCompany || 'Not specified'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone (optional)
              </label>
              {isEditingProfile ? (
                <Input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {profilePhone || 'Not specified'}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4">
              {isEditingProfile ? (
                <>
                  <Button variant="primary" onClick={handleSaveProfile} isLoading={isSavingProfile} disabled={isSavingProfile}>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileName(user?.name || '');
                      setProfileEmail(user?.email || '');
                      setProfileCompany('');
                      setProfilePhone('');
                    }}
                    disabled={isSavingProfile}
                  >
                    <X size={16} className="mr-2" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={() => setIsEditingProfile(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
          )}
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <StageManager />
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifications</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Receive important notifications by email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">In-App Notifications</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Show notifications within the application
                  </p>
                  {unreadCount > 0 && (
                    <p className="text-xs text-primary-600 mt-1">
                      You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inAppNotifications}
                    onChange={(e) => setInAppNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Weekly Reports</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Receive a weekly summary of metrics and activity
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weeklyReports}
                    onChange={(e) => setWeeklyReports(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button variant="primary" onClick={handleSavePreferences}>
                  <Save size={16} className="mr-2" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tutorials</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Reset Tutorials</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Show the interactive tutorials again to learn how to use InvestiaFlow
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={handleResetOnboarding}
                  isLoading={isResettingOnboarding}
                  disabled={isResettingOnboarding}
                >
                  <BookOpen size={16} className="mr-2" />
                  Reset Tutorials
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-900">User ID</h3>
                  <p className="text-sm text-gray-500 mt-1">Unique identifier for your account</p>
                </div>
                <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
                  {user?.id}
                </code>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-900">Authentication Provider</h3>
                  <p className="text-sm text-gray-500 mt-1">Sign-in method</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                  {(() => {
                    const providerData = firebaseUser?.providerData as Array<{ providerId?: string }> | undefined;
                    return providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email/Password';
                  })()}
                </span>
              </div>

              {!!firebaseUser?.metadata && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-medium text-gray-900">Account created</h3>
                    <p className="text-sm text-gray-500 mt-1">Account creation date</p>
                  </div>
                  <span className="text-sm text-gray-700">
                    {new Date((firebaseUser.metadata as { creationTime: string }).creationTime).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Danger Zone</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
                <p className="text-sm text-red-700 mb-4">
                  This action cannot be undone. All your data, leads, documents and settings will be permanently deleted.
                </p>
                <Button variant="secondary" className="bg-red-600 hover:bg-red-700 text-white">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default SettingsPage;
