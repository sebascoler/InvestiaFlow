export interface UserProfile {
  id: string; // userId
  name: string;
  email: string;
  photoURL?: string;
  company?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileUpdate {
  name?: string;
  email?: string;
  photoURL?: string;
  company?: string;
  phone?: string;
}
