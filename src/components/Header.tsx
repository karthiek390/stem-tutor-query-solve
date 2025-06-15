
import React, { useState, useEffect, useRef } from 'react';
import { Palette, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Slider } from '@/components/ui/slider';

const Header: React.FC = () => {
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const { darknessLevel, setDarknessLevel } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isOnHomePage = location.pathname === '/';

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isThemeModalOpen) {
        setIsThemeModalOpen(false);
        buttonRef.current?.focus(); // Return focus to button
      }
    };

    if (isThemeModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus trap - focus the modal when it opens
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isThemeModalOpen]);

  // Handle clicking outside modal to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsThemeModalOpen(false);
    }
  };

  const handleSliderChange = (values: number[]) => {
    setDarknessLevel(values[0]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        setDarknessLevel(Math.max(0, darknessLevel - 5));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        setDarknessLevel(Math.min(100, darknessLevel + 5));
        break;
      case 'Home':
        e.preventDefault();
        setDarknessLevel(0);
        break;
      case 'End':
        e.preventDefault();
        setDarknessLevel(100);
        break;
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <>
      {/* Header Bar */}
      <header 
        className="fixed top-0 left-0 right-0 z-40 h-16 shadow-sm border-b"
        style={{
          backgroundColor: 'var(--theme-bg)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text)'
        }}
      >
        <div className="flex items-center justify-between h-full px-6">
          {/* App Logo/Name and Home Button */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🧮</div>
              <h1 className="text-xl font-semibold">STEM Tutor</h1>
            </div>
            <button
              onClick={handleHomeClick}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer ${
                isOnHomePage 
                  ? 'font-bold underline' 
                  : 'hover:opacity-80'
              }`}
              style={{
                color: 'var(--theme-text)'
              }}
            >
              Home
            </button>
          </div>

          {/* Theme Control Button */}
          <button
            ref={buttonRef}
            onClick={() => setIsThemeModalOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-border)'
            }}
            aria-label="Open theme settings"
            aria-expanded={isThemeModalOpen}
          >
            <Palette size={20} />
          </button>
        </div>
      </header>

      {/* Modal Overlay */}
      {isThemeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="theme-modal-title"
        >
          {/* Backdrop Blur Effect */}
          <div className="absolute inset-0 backdrop-blur-sm" />
          
          {/* Theme Control Modal */}
          <div
            ref={modalRef}
            className="relative bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl p-6 shadow-2xl min-w-[320px] max-w-md mx-4 animate-scale-in"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text)'
            }}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="text-lg">🌈</div>
                <h3 id="theme-modal-title" className="font-semibold text-lg">Theme Control</h3>
                <span className="text-sm opacity-70 ml-auto">{darknessLevel}%</span>
              </div>
              <button
                onClick={() => setIsThemeModalOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Close theme settings"
              >
                <X size={16} />
              </button>
            </div>

            {/* Theme Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {/* Sun Icon */}
                <div className="flex-shrink-0">
                  <div 
                    className={`text-lg transition-all duration-200 ${
                      darknessLevel < 30 ? 'scale-110' : 'scale-100 opacity-60'
                    }`}
                  >
                    ☀️
                  </div>
                </div>

                {/* Slider */}
                <div className="flex-1 px-2">
                  <Slider
                    value={[darknessLevel]}
                    onValueChange={handleSliderChange}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                    onKeyDown={handleKeyDown}
                    aria-label="Theme darkness level"
                    aria-valuetext={`${darknessLevel}% darkness`}
                  />
                </div>

                {/* Moon Icon */}
                <div className="flex-shrink-0">
                  <div 
                    className={`text-lg transition-all duration-200 ${
                      darknessLevel > 70 ? 'scale-110' : 'scale-100 opacity-60'
                    }`}
                  >
                    🌙
                  </div>
                </div>
              </div>

              {/* Gradient Bar Visual */}
              <div className="relative h-2 rounded-full overflow-hidden bg-gradient-to-r from-yellow-200 via-gray-400 to-slate-800">
                <div 
                  className="absolute top-0 left-0 h-full bg-white/30 rounded-full transition-all duration-200"
                  style={{ width: `${darknessLevel}%` }}
                />
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Light', value: 10, emoji: '☀️' },
                  { label: 'Auto', value: 30, emoji: '🌤️' },
                  { label: 'Dim', value: 60, emoji: '🌙' },
                  { label: 'Dark', value: 90, emoji: '🌑' }
                ].map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setDarknessLevel(preset.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      Math.abs(darknessLevel - preset.value) < 5
                        ? 'ring-2 ring-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={{
                      backgroundColor: Math.abs(darknessLevel - preset.value) < 5 
                        ? 'var(--theme-accent)' 
                        : undefined,
                      opacity: Math.abs(darknessLevel - preset.value) < 5 ? 0.8 : 0.6
                    }}
                    aria-label={`Set theme to ${preset.label} (${preset.value}%)`}
                  >
                    <span className="text-base">{preset.emoji}</span>
                    <span className="font-medium">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
