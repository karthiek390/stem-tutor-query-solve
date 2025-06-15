
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import ThemeControlBar from './ThemeControlBar';

const Header: React.FC = () => {
  const [isThemeControlOpen, setIsThemeControlOpen] = useState(false);

  const toggleThemeControl = () => {
    setIsThemeControlOpen(!isThemeControlOpen);
  };

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text)'
        }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold">
              <span style={{ color: 'var(--theme-accent)' }}>My</span>
              <span>App</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="#" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: 'var(--theme-text)' }}
            >
              Home
            </a>
            <a 
              href="#" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: 'var(--theme-text)' }}
            >
              About
            </a>
            <a 
              href="#" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: 'var(--theme-text)' }}
            >
              Services
            </a>
            <a 
              href="#" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: 'var(--theme-text)' }}
            >
              Contact
            </a>
          </nav>

          {/* Theme Control Button */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleThemeControl}
              className="flex items-center gap-2 relative"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: isThemeControlOpen ? 'var(--theme-accent)' : 'transparent',
                color: isThemeControlOpen ? 'white' : 'var(--theme-text)'
              }}
            >
              <Palette size={16} />
              <span className="hidden sm:inline">Theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Theme Control Bar - Conditionally Rendered */}
      {isThemeControlOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsThemeControlOpen(false)}
          />
          
          {/* Modified Theme Control Bar */}
          <div className="fixed top-20 right-4 z-50">
            <div 
              className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl p-4 shadow-lg min-w-[280px]"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)'
              }}
            >
              <ThemeControlBar />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
