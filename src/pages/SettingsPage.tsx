import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Info, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { ToastContainer, ToastType } from '../components/shared/Toast';
import { userProfileService } from '../services/userProfileService';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const SettingsPage: React.FC = () => {
  const { user, firebaseUser, updateProfile } = useAuth();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'account'>('profile');
  const [toasts, setToasts] = useState<Toast[]>([]);
  
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
      addToast('Usuario no autenticado', 'error');
      return;
    }

    // Validate fields
    if (!profileName.trim()) {
      addToast('El nombre es requerido', 'error');
      return;
    }

    if (!profileEmail.trim() || !profileEmail.includes('@')) {
      addToast('El email debe ser válido', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updates: any = {
        name: profileName.trim(),
        company: profileCompany.trim() || undefined,
        phone: profilePhone.trim() || undefined,
      };
      
      // Only update email if not using Firebase Auth
      if (!firebaseUser) {
        updates.email = profileEmail.trim();
      }
      
      await updateProfile(updates);
      
      addToast('Perfil actualizado correctamente', 'success');
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      addToast(error.message || 'Error al actualizar el perfil', 'error');
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
    addToast('Preferencias guardadas', 'success');
  };

  const tabs = [
    { id: 'profile' as const, label: 'Perfil', icon: User },
    { id: 'preferences' as const, label: 'Preferencias', icon: Bell },
    { id: 'account' as const, label: 'Cuenta', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">Gestiona tu perfil, preferencias y configuración de cuenta</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Información del Perfil</h2>
          
          {profileLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              {isEditingProfile ? (
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Tu nombre"
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
              {firebaseUser && (
                <p className="text-xs text-gray-500 mt-1">
                  El email está vinculado a tu cuenta de Firebase y no puede cambiarse desde aquí. Para cambiar tu email, actualízalo en la configuración de Firebase Auth.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa (opcional)
              </label>
              {isEditingProfile ? (
                <Input
                  value={profileCompany}
                  onChange={(e) => setProfileCompany(e.target.value)}
                  placeholder="Nombre de tu empresa"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {profileCompany || 'No especificada'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (opcional)
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
                  {profilePhone || 'No especificado'}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4">
              {isEditingProfile ? (
                <>
                  <Button variant="primary" onClick={handleSaveProfile} isLoading={isSavingProfile} disabled={isSavingProfile}>
                    <Save size={16} className="mr-2" />
                    Guardar Cambios
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
                  Editar Perfil
                </Button>
              )}
            </div>
          </div>
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notificaciones</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Notificaciones por Email</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Recibe notificaciones importantes por correo electrónico
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
                  <h3 className="font-medium text-gray-900">Notificaciones In-App</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Muestra notificaciones dentro de la aplicación
                  </p>
                  {unreadCount > 0 && (
                    <p className="text-xs text-primary-600 mt-1">
                      Tienes {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
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
                  <h3 className="font-medium text-gray-900">Reportes Semanales</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Recibe un resumen semanal de métricas y actividad
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
                  Guardar Preferencias
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de la Cuenta</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-900">ID de Usuario</h3>
                  <p className="text-sm text-gray-500 mt-1">Identificador único de tu cuenta</p>
                </div>
                <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
                  {user?.id}
                </code>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-900">Proveedor de Autenticación</h3>
                  <p className="text-sm text-gray-500 mt-1">Método de inicio de sesión</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                  {firebaseUser?.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email/Password'}
                </span>
              </div>

              {firebaseUser?.metadata && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-medium text-gray-900">Cuenta creada</h3>
                    <p className="text-sm text-gray-500 mt-1">Fecha de creación de la cuenta</p>
                  </div>
                  <span className="text-sm text-gray-700">
                    {new Date(firebaseUser.metadata.creationTime).toLocaleDateString('es-ES', {
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Zona de Peligro</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-900 mb-2">Eliminar Cuenta</h3>
                <p className="text-sm text-red-700 mb-4">
                  Esta acción no se puede deshacer. Se eliminarán todos tus datos, leads, documentos y configuraciones.
                </p>
                <Button variant="secondary" className="bg-red-600 hover:bg-red-700 text-white">
                  Eliminar Cuenta
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
