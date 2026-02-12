import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { userProfileService } from '../services/userProfileService';
import { OnboardingProgress } from '../types/userProfile';

interface OnboardingContextType {
  progress: OnboardingProgress | null;
  isLoading: boolean;
  startOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  completeTutorial: (tutorialId: string) => Promise<void>;
  skipTutorial: (tutorialId: string) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  updateProgress: (updates: Partial<OnboardingProgress>) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

const defaultProgress: OnboardingProgress = {
  completed: false,
  currentStep: 0,
  completedTutorials: [],
  skippedTutorials: [],
};

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding progress when user is authenticated
  useEffect(() => {
    const loadProgress = async () => {
      if (!isAuthenticated || !user) {
        setProgress(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await userProfileService.getProfile(user.id);
        if (profile?.onboardingProgress) {
          setProgress(profile.onboardingProgress);
        } else {
          // Initialize default progress if none exists
          setProgress(defaultProgress);
        }
      } catch (error) {
        console.error('[OnboardingContext] Error loading progress:', error);
        setProgress(defaultProgress);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user, isAuthenticated]);

  const updateProgressInFirestore = async (updates: Partial<OnboardingProgress>) => {
    if (!user) return;

    try {
      const currentProfile = await userProfileService.getProfile(user.id);
      const currentProgress = currentProfile?.onboardingProgress || defaultProgress;
      
      // Build updated progress, filtering out undefined values
      const updatedProgress: Partial<OnboardingProgress> = {
        ...currentProgress,
      };
      
      // Apply updates, filtering undefined
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof OnboardingProgress];
        if (value !== undefined) {
          (updatedProgress as any)[key] = value;
        }
        // If undefined, don't include it in the update
      });
      
      // Ensure required fields are present, but don't include lastCompletedAt if undefined
      const finalProgress: OnboardingProgress = {
        completed: updatedProgress.completed ?? false,
        currentStep: updatedProgress.currentStep ?? 0,
        completedTutorials: updatedProgress.completedTutorials ?? [],
        skippedTutorials: updatedProgress.skippedTutorials ?? [],
      };
      
      // Only include lastCompletedAt if it has a value
      if (updatedProgress.lastCompletedAt !== undefined) {
        finalProgress.lastCompletedAt = updatedProgress.lastCompletedAt;
      }

      await userProfileService.updateProfile(user.id, {
        onboardingProgress: finalProgress,
      });

      setProgress(finalProgress);
    } catch (error) {
      console.error('[OnboardingContext] Error updating progress:', error);
      throw error;
    }
  };

  const startOnboarding = async () => {
    await updateProgressInFirestore({
      completed: false,
      currentStep: 0,
      completedTutorials: [],
      skippedTutorials: [],
    });
  };

  const completeOnboarding = async () => {
    await updateProgressInFirestore({
      completed: true,
      lastCompletedAt: new Date(),
    });
  };

  const completeTutorial = async (tutorialId: string) => {
    if (!progress) return;

    const updatedCompleted = [...progress.completedTutorials];
    if (!updatedCompleted.includes(tutorialId)) {
      updatedCompleted.push(tutorialId);
    }

    // Remove from skipped if it was skipped
    const updatedSkipped = progress.skippedTutorials.filter(id => id !== tutorialId);

    await updateProgressInFirestore({
      completedTutorials: updatedCompleted,
      skippedTutorials: updatedSkipped,
    });
  };

  const skipTutorial = async (tutorialId: string) => {
    if (!progress) return;

    const updatedSkipped = [...progress.skippedTutorials];
    if (!updatedSkipped.includes(tutorialId)) {
      updatedSkipped.push(tutorialId);
    }

    await updateProgressInFirestore({
      skippedTutorials: updatedSkipped,
    });
  };

  const resetOnboarding = async () => {
    const updates: Partial<OnboardingProgress> = {
      completed: false,
      currentStep: 0,
      completedTutorials: [],
      skippedTutorials: [],
    };
    // Don't include lastCompletedAt if we want to remove it - use null or deleteField
    await updateProgressInFirestore(updates);
  };

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    await updateProgressInFirestore(updates);
  };

  return (
    <OnboardingContext.Provider
      value={{
        progress,
        isLoading,
        startOnboarding,
        completeOnboarding,
        completeTutorial,
        skipTutorial,
        resetOnboarding,
        updateProgress,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
