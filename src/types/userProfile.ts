export interface OnboardingProgress {
  completed: boolean;
  currentStep?: number;
  completedTutorials: string[];
  skippedTutorials: string[];
  lastCompletedAt?: Date;
}

export interface UserProfile {
  id: string; // userId
  name: string;
  email: string;
  photoURL?: string;
  company?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  onboardingProgress?: OnboardingProgress;
}

export interface UserProfileUpdate {
  name?: string;
  email?: string;
  photoURL?: string;
  company?: string;
  phone?: string;
  onboardingProgress?: OnboardingProgress;
}
