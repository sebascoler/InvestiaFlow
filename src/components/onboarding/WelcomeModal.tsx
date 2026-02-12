import React from 'react';
import { OnboardingModal } from './OnboardingModal';
import { useOnboarding } from '../../hooks/useOnboarding';

const welcomeSlides = [
  {
    title: '¡Bienvenido a InvestiaFlow!',
    content: (
      <div className="space-y-3">
        <p>
          InvestiaFlow es tu CRM completo para gestionar todo el proceso de fundraising.
        </p>
        <p>
          Te ayudamos a organizar tus leads, compartir documentos con inversores y hacer seguimiento de cada etapa del proceso.
        </p>
      </div>
    ),
  },
  {
    title: 'Pipeline de CRM',
    content: (
      <div className="space-y-3">
        <p>
          Organiza tus inversores potenciales en un pipeline visual con 8 stages diferentes, desde el primer contacto hasta el cierre.
        </p>
        <p>
          Arrastra y suelta leads entre stages para reflejar el progreso real de cada conversación.
        </p>
      </div>
    ),
  },
  {
    title: 'Data Room',
    content: (
      <div className="space-y-3">
        <p>
          Comparte documentos de forma segura con inversores. Configura cuándo compartir cada documento según el stage del lead.
        </p>
        <p>
          Haz seguimiento de qué documentos han visto o descargado tus inversores.
        </p>
      </div>
    ),
  },
  {
    title: 'Trabajo en Equipo',
    content: (
      <div className="space-y-3">
        <p>
          Invita miembros a tu equipo y asigna roles según sus responsabilidades.
        </p>
        <p>
          Personaliza el branding de tu equipo con tu logo y colores corporativos.
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
