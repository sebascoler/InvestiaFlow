import React, { useState, useEffect, useRef } from 'react';
import { X, HelpCircle } from 'lucide-react';

interface ContextualTooltipProps {
  id: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  showOnce?: boolean;
  onDismiss?: (id: string) => void;
}

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  id,
  content,
  position = 'top',
  children,
  showOnce = true,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if tooltip was already dismissed
    const dismissedKey = `tooltip_dismissed_${id}`;
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true';
    
    if (wasDismissed && showOnce) {
      setIsDismissed(true);
      return;
    }

    // Show tooltip on first interaction
    const handleFirstInteraction = () => {
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    const trigger = triggerRef.current;
    if (trigger) {
      trigger.addEventListener('mouseenter', handleFirstInteraction, { once: true });
      trigger.addEventListener('focus', handleFirstInteraction, { once: true });
    }

    return () => {
      if (trigger) {
        trigger.removeEventListener('mouseenter', handleFirstInteraction);
        trigger.removeEventListener('focus', handleFirstInteraction);
      }
    };
  }, [id, isDismissed, showOnce]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    
    if (showOnce) {
      localStorage.setItem(`tooltip_dismissed_${id}`, 'true');
    }
    
    onDismiss?.(id);
  };

  if (isDismissed && showOnce) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900',
  };

  return (
    <div className="relative inline-block" ref={triggerRef}>
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[position]}`}
          role="tooltip"
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg shadow-lg p-3 max-w-xs relative">
            <div className="flex items-start gap-2">
              <HelpCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p className="flex-1">{content}</p>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                aria-label="Dismiss tooltip"
              >
                <X size={14} />
              </button>
            </div>
            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
