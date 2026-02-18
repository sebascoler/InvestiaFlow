import React from 'react';
import { OnboardingModal } from './OnboardingModal';
import { useOnboarding } from '../../hooks/useOnboarding';

const welcomeSlides = [
  {
    title: 'Welcome to InvestiaFlow!',
    content: (
      <div className="space-y-3">
        <p>
          InvestiaFlow is your complete CRM to manage the entire fundraising process.
        </p>
        <p>
          We help you organize your leads, share documents with investors, and track every stage of the process.
        </p>
      </div>
    ),
  },
  {
    title: 'CRM Pipeline',
    content: (
      <div className="space-y-3">
        <p>
          Organize your potential investors in a visual pipeline with 8 different stages, from first contact to close.
        </p>
        <p>
          Drag and drop leads between stages to reflect the real progress of each conversation.
        </p>
      </div>
    ),
  },
  {
    title: 'Data Room',
    content: (
      <div className="space-y-3">
        <p>
          Share documents securely with investors. Configure when to share each document based on the lead&apos;s stage.
        </p>
        <p>
          Track which documents your investors have viewed or downloaded.
        </p>
      </div>
    ),
  },
  {
    title: 'Team Collaboration',
    content: (
      <div className="space-y-3">
        <p>
          Invite team members and assign roles according to their responsibilities.
        </p>
        <p>
          Customize your team branding with your logo and corporate colors.
        </p>
      </div>
    ),
  },
];

export const WelcomeModal: React.FC = () => {
  const { shouldShowWelcome, startOnboarding, skipTutorial, completeOnboarding, completeTutorial, progress } = useOnboarding();
  const [isOpen, setIsOpen] = React.useState(false);
  const [hasStartedTour, setHasStartedTour] = React.useState(false);

  React.useEffect(() => {
    // Only show welcome if user should see it AND no tour has been started
    if (shouldShowWelcome && !hasStartedTour) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [shouldShowWelcome, hasStartedTour]);

  // Prevent showing if any tutorial has been started or completed
  React.useEffect(() => {
    if (progress && (progress.completedTutorials.length > 0 || progress.skippedTutorials.length > 0 || progress.completed)) {
      setHasStartedTour(true);
      setIsOpen(false);
    }
  }, [progress]);

  const handleStartTour = async () => {
    setIsOpen(false);
    setHasStartedTour(true);
    // Mark welcome as completed and start onboarding
    await startOnboarding();
    // Mark welcome tutorial as completed so tours can appear
    await completeTutorial('welcome');
    // Small delay to ensure modal is closed and state is updated before tour starts
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleSkip = async () => {
    setIsOpen(false);
    setHasStartedTour(true);
    // Mark welcome as skipped and mark onboarding as completed so no tours appear
    await skipTutorial('welcome');
    await completeOnboarding(); // Mark onboarding as completed
  };

  if (!shouldShowWelcome || hasStartedTour) {
    return null;
  }

  return (
    <OnboardingModal
      isOpen={isOpen}
      onClose={handleSkip}
      onStartTour={handleStartTour}
      onSkip={handleSkip}
      slides={welcomeSlides}
    />
  );
};
