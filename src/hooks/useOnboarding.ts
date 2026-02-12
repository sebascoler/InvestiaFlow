import { useEffect, useState } from 'react';
import { useOnboarding as useOnboardingContext } from '../contexts/OnboardingContext';
import { useAuth } from '../contexts/AuthContext';

export const useOnboarding = () => {
  const {
    progress,
    isLoading,
    startOnboarding,
    completeOnboarding,
    completeTutorial,
    skipTutorial,
    resetOnboarding,
    updateProgress,
  } = useOnboardingContext();
  
  const { user, isAuthenticated } = useAuth();
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);

  useEffect(() => {
    // Check if user should see welcome modal
    if (isAuthenticated && user && progress) {
      // Show welcome if onboarding hasn't been completed and no tutorials have been started
      const isNewUser = !progress.completed && 
                        progress.completedTutorials.length === 0 && 
                        progress.skippedTutorials.length === 0;
      setShouldShowWelcome(isNewUser);
    } else {
      setShouldShowWelcome(false);
    }
  }, [isAuthenticated, user, progress]);

  const hasCompletedTutorial = (tutorialId: string): boolean => {
    return progress?.completedTutorials.includes(tutorialId) || false;
  };

  const hasSkippedTutorial = (tutorialId: string): boolean => {
    return progress?.skippedTutorials.includes(tutorialId) || false;
  };

  const shouldShowTutorial = (tutorialId: string): boolean => {
    if (!progress) return false;
    // If onboarding is completed, don't show tutorials
    if (progress.completed) return false;
    // If tutorial is already completed, don't show it
    if (hasCompletedTutorial(tutorialId)) return false;
    // If tutorial is skipped, don't show it
    if (hasSkippedTutorial(tutorialId)) return false;
    
    // Show tutorial if onboarding was explicitly started
    // This happens when:
    // 1. User clicked "Comenzar Tour" in welcome modal (welcome is completed)
    // 2. User clicked "Iniciar Tutoriales" in Help page (startOnboarding was called)
    const welcomeCompleted = progress.completedTutorials.includes('welcome');
    const onboardingStarted = progress.completedTutorials.length > 0 || 
                              progress.skippedTutorials.length > 0;
    
    // Show if welcome was completed (user chose to start tour) OR onboarding was started
    return welcomeCompleted || onboardingStarted;
  };

  return {
    progress,
    isLoading,
    shouldShowWelcome,
    startOnboarding,
    completeOnboarding,
    completeTutorial,
    skipTutorial,
    resetOnboarding,
    updateProgress,
    hasCompletedTutorial,
    hasSkippedTutorial,
    shouldShowTutorial,
  };
};
