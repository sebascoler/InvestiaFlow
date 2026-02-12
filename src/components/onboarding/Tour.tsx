import React, { useState, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface TourProps {
  steps: Step[];
  tourId: string;
  continuous?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export const Tour: React.FC<TourProps> = ({
  steps,
  tourId,
  continuous = true,
  showProgress = true,
  showSkipButton = true,
  onComplete,
  onSkip,
}) => {
  const { completeTutorial, skipTutorial, progress } = useOnboarding();
  const [run, setRun] = useState(false);

  React.useEffect(() => {
    // Only start tour if it hasn't been completed or skipped
    if (progress) {
      const isCompleted = progress.completedTutorials.includes(tourId);
      const isSkipped = progress.skippedTutorials.includes(tourId);
      
      if (!isCompleted && !isSkipped) {
        // Verify elements exist before starting
        const allElementsExist = steps.every(step => {
          if (step.target && typeof step.target === 'string') {
            return document.querySelector(step.target) !== null;
          }
          return true;
        });
        
        if (allElementsExist) {
          setRun(true);
        }
      }
    }
  }, [steps, tourId, progress]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      
      if (status === STATUS.FINISHED) {
        completeTutorial(tourId).then(() => {
          onComplete?.();
        });
      } else if (status === STATUS.SKIPPED || action === 'skip') {
        skipTutorial(tourId).then(() => {
          onSkip?.();
        });
      }
    }
  }, [tourId, completeTutorial, skipTutorial, onComplete, onSkip]);

  if (steps.length === 0) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={continuous}
      showProgress={showProgress}
      showSkipButton={showSkipButton}
      callback={handleJoyrideCallback}
      disableScrolling={true}
      disableOverlayClose={false}
      scrollOffset={0}
      scrollToFirstStep={false}
      spotlightClicks={false}
      styles={{
        options: {
          primaryColor: 'var(--color-primary, #0284c7)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '8px',
          fontSize: '14px',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: 'var(--color-primary, #0284c7)',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 600,
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: '8px',
          fontSize: '14px',
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '14px',
        },
        spotlight: {
          borderRadius: '8px',
        },
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar',
      }}
    />
  );
};
