import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTeam } from './TeamContext';
import { TeamBranding } from '../types/team';

interface ThemeContextType {
  branding: TeamBranding | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  companyName: string;
  applyTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Default branding colors (InvestiaFlow default)
const DEFAULT_PRIMARY = '#0284c7';
const DEFAULT_SECONDARY = '#0ea5e9';
const DEFAULT_ACCENT = '#06b6d4';
const DEFAULT_COMPANY_NAME = 'InvestiaFlow';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { currentTeam } = useTeam();
  const [branding, setBranding] = useState<TeamBranding | null>(null);

  // Get branding from current team
  useEffect(() => {
    if (currentTeam?.branding) {
      setBranding(currentTeam.branding);
    } else {
      setBranding(null);
    }
  }, [currentTeam?.branding]);

  // Extract colors with defaults
  const primaryColor = branding?.primaryColor || DEFAULT_PRIMARY;
  const secondaryColor = branding?.secondaryColor || DEFAULT_SECONDARY;
  const accentColor = branding?.accentColor || DEFAULT_ACCENT;
  const logoUrl = branding?.logoUrl || null;
  const companyName = branding?.companyName || currentTeam?.name || DEFAULT_COMPANY_NAME;

  // Apply CSS custom properties for theme colors
  useEffect(() => {
    const root = document.documentElement;
    
    // Set CSS variables for colors
    root.style.setProperty('--color-primary', primaryColor);
    root.style.setProperty('--color-secondary', secondaryColor);
    root.style.setProperty('--color-accent', accentColor);
    
    // Convert hex to RGB for opacity variants
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const primaryRgb = hexToRgb(primaryColor);
    if (primaryRgb) {
      root.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
    }

    // Apply theme (light/dark/auto)
    const theme = branding?.theme || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Auto theme - use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [primaryColor, secondaryColor, accentColor, branding?.theme]);

  const applyTheme = () => {
    // This function can be called to reapply theme if needed
    // The useEffect above handles automatic application
  };

  return (
    <ThemeContext.Provider
      value={{
        branding,
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl,
        companyName,
        applyTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
