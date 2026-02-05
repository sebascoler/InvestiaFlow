// Firebase implementation of userProfileService
import { UserProfile, UserProfileUpdate } from '../types/userProfile';
import { firestoreService, timestampToDate, dateToTimestamp } from '../firebase/firestore';

const USER_PROFILES_COLLECTION = 'userProfiles';

// Helper to convert Firestore data to UserProfile
const firestoreToProfile = (data: any): UserProfile => {
  return {
    ...data,
    createdAt: timestampToDate(data.createdAt) || new Date(),
    updatedAt: timestampToDate(data.updatedAt) || new Date(),
  } as UserProfile;
};

// Helper to convert UserProfile to Firestore data
const profileToFirestore = (profile: Partial<UserProfile>): any => {
  const data: any = { ...profile };
  
  // Remove undefined fields
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });
  
  // Convert dates to timestamps
  if (data.createdAt) data.createdAt = dateToTimestamp(data.createdAt);
  if (data.updatedAt) data.updatedAt = dateToTimestamp(data.updatedAt);
  
  return data;
};

export const userProfileServiceFirebase = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profile = await firestoreService.getDoc<UserProfile>(
        USER_PROFILES_COLLECTION,
        userId
      );
      
      if (!profile) {
        return null;
      }
      
      return firestoreToProfile(profile);
    } catch (error) {
      console.error('[userProfileServiceFirebase] Error getting profile:', error);
      throw error;
    }
  },

  async createProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
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
      
      const firestoreData = profileToFirestore(profile);
      await firestoreService.setDoc(USER_PROFILES_COLLECTION, userId, firestoreData);
      
      return profile;
    } catch (error) {
      console.error('[userProfileServiceFirebase] Error creating profile:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, updates: UserProfileUpdate): Promise<UserProfile> {
    try {
      const existing = await this.getProfile(userId);
      const now = new Date();
      
      if (!existing) {
        // Create if doesn't exist
        return this.createProfile(userId, updates);
      }
      
      const updated: UserProfile = {
        ...existing,
        ...updates,
        updatedAt: now,
      };
      
      const firestoreData = profileToFirestore(updated);
      await firestoreService.updateDoc(USER_PROFILES_COLLECTION, userId, firestoreData);
      
      return updated;
    } catch (error) {
      console.error('[userProfileServiceFirebase] Error updating profile:', error);
      throw error;
    }
  },
};
