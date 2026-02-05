// User Profile Service - Uses Firebase if available, otherwise mock
import { UserProfile, UserProfileUpdate } from '../types/userProfile';

const USER_PROFILES_COLLECTION = 'userProfiles';

// Mock storage
const profilesDB: UserProfile[] = [];

export const userProfileServiceMock = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const profile = profilesDB.find(p => p.id === userId);
    if (profile) {
      return { ...profile };
    }
    
    // Return default profile if not found
    return null;
  },

  async createProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const now = new Date();
    const profile: UserProfile = {
      id: userId,
      name: data.name || 'User',
      email: data.email || '',
      photoURL: data.photoURL,
      company: data.company,
      phone: data.phone,
      createdAt: now,
      updatedAt: now,
    };
    
    profilesDB.push(profile);
    return { ...profile };
  },

  async updateProfile(userId: string, updates: UserProfileUpdate): Promise<UserProfile> {
    const index = profilesDB.findIndex(p => p.id === userId);
    const now = new Date();
    
    if (index === -1) {
      // Create if doesn't exist
      return this.createProfile(userId, updates);
    }
    
    const updated: UserProfile = {
      ...profilesDB[index],
      ...updates,
      updatedAt: now,
    };
    
    profilesDB[index] = updated;
    return { ...updated };
  },
};

// Try to load Firebase service
const getFirebaseService = async () => {
  try {
    const { isFirebaseReady } = await import('../firebase/config');
    if (isFirebaseReady()) {
      const { userProfileServiceFirebase } = await import('./userProfileService.firebase');
      return userProfileServiceFirebase;
    }
    return null;
  } catch (error) {
    console.warn('Firebase service not available, using mock:', error);
    return null;
  }
};

// Export service that uses Firebase if available, otherwise mock
export const userProfileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const service = await getFirebaseService();
    return service 
      ? service.getProfile(userId) 
      : userProfileServiceMock.getProfile(userId);
  },

  async createProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const service = await getFirebaseService();
    return service 
      ? service.createProfile(userId, data) 
      : userProfileServiceMock.createProfile(userId, data);
  },

  async updateProfile(userId: string, updates: UserProfileUpdate): Promise<UserProfile> {
    const service = await getFirebaseService();
    return service 
      ? service.updateProfile(userId, updates) 
      : userProfileServiceMock.updateProfile(userId, updates);
  },
};
