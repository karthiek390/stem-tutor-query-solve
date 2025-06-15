
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  darknessLevel: number;
  setDarknessLevel: (level: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Default to 30% darkness (slightly light as requested)
  const [darknessLevel, setDarknessLevelState] = useState(30);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-darkness-level');
    if (savedTheme) {
      const level = parseInt(savedTheme, 10);
      if (level >= 0 && level <= 100) {
        setDarknessLevelState(level);
      }
    }
  }, []);

  // Update CSS variables whenever darkness level changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Calculate colors based on darkness level (0 = light, 100 = dark)
    // Background: from white to very dark gray
    const bgLightness = Math.max(5, 100 - darknessLevel); // Never fully black, min 5%
    const cardLightness = Math.max(10, 105 - darknessLevel); // Card slightly lighter than bg
    
    // Text: from dark to light
    const textLightness = darknessLevel > 50 ? 90 : 10; // Light text on dark bg, dark text on light bg
    
    // Accent colors adjust based on theme
    const accentLightness = darknessLevel > 50 ? 70 : 40;
    
    // Apply CSS custom properties for theme
    root.style.setProperty('--theme-bg', `hsl(210, 20%, ${bgLightness}%)`);
    root.style.setProperty('--theme-card-bg', `hsl(210, 25%, ${cardLightness}%)`);
    root.style.setProperty('--theme-text', `hsl(210, 15%, ${textLightness}%)`);
    root.style.setProperty('--theme-text-muted', `hsl(210, 15%, ${textLightness + (darknessLevel > 50 ? -20 : 20)}%)`);
    root.style.setProperty('--theme-accent', `hsl(222, 47%, ${accentLightness}%)`);
    root.style.setProperty('--theme-border', `hsl(210, 20%, ${Math.max(15, Math.min(85, bgLightness + (darknessLevel > 50 ? 15 : -15)))}%)`);
  }, [darknessLevel]);

  const setDarknessLevel = (level: number) => {
    // Clamp value between 0 and 100
    const clampedLevel = Math.max(0, Math.min(100, level));
    setDarknessLevelState(clampedLevel);
    
    // Save to localStorage
    localStorage.setItem('theme-darkness-level', clampedLevel.toString());
  };

  return (
    <ThemeContext.Provider value={{ darknessLevel, setDarknessLevel }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
