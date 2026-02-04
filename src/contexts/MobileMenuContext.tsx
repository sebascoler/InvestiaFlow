import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MobileMenuContextType {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext);
  if (!context) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider');
  }
  return context;
};

interface MobileMenuProviderProps {
  children: ReactNode;
}

export const MobileMenuProvider: React.FC<MobileMenuProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = useCallback(() => {
    console.log('Opening menu');
    setIsOpen(true);
  }, []);
  
  const closeMenu = useCallback(() => {
    console.log('Closing menu');
    setIsOpen(false);
  }, []);
  
  const toggleMenu = useCallback(() => {
    console.log('Toggling menu, current state:', isOpen);
    setIsOpen(prev => {
      console.log('New state will be:', !prev);
      return !prev;
    });
  }, [isOpen]);

  return (
    <MobileMenuContext.Provider
      value={{
        isOpen,
        openMenu,
        closeMenu,
        toggleMenu,
      }}
    >
      {children}
    </MobileMenuContext.Provider>
  );
};
