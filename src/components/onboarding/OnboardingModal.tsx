import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';

interface OnboardingSlide {
  title: string;
  content: React.ReactNode;
  image?: string;
  imageAlt?: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  onSkip: () => void;
  slides: OnboardingSlide[];
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartTour,
  onSkip,
  slides,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen || slides.length === 0) {
    return null;
  }

  const slide = slides[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onStartTour();
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstSlide) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} size="lg">
      <div className="relative">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Image */}
        {slide.image && (
          <div className="mb-6 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={slide.image}
              alt={slide.imageAlt || slide.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{slide.title}</h2>
          <div className="text-gray-600 leading-relaxed">{slide.content}</div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-primary-600 w-8'
                  : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <div>
            {!isFirstSlide && (
              <Button variant="secondary" onClick={handlePrevious}>
                <ChevronLeft size={18} className="mr-2" />
                Anterior
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleSkip}>
              Saltar
            </Button>
            <Button variant="primary" onClick={handleNext}>
              {isLastSlide ? 'Comenzar Tour' : 'Siguiente'}
              {!isLastSlide && <ChevronRight size={18} className="ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
