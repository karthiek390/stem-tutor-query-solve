
import React, { useState, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Slider } from '@/components/ui/slider';

const ThemeControlBar: React.FC = () => {
  const { darknessLevel, setDarknessLevel } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

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

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl p-4 shadow-lg min-w-[280px]"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text)'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="text-lg">🌈</div>
          <h3 className="font-semibold text-sm">Theme Control</h3>
          <span className="text-xs opacity-70 ml-auto">{darknessLevel}%</span>
        </div>

        {/* Slider Container */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Sun Icon */}
            <div className="flex-shrink-0">
              <Sun 
                size={18} 
                className={`transition-all duration-200 ${
                  darknessLevel < 30 ? 'text-yellow-500 scale-110' : 'text-gray-400 scale-100'
                }`}
              />
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
              <Moon 
                size={18} 
                className={`transition-all duration-200 ${
                  darknessLevel > 70 ? 'text-blue-400 scale-110' : 'text-gray-400 scale-100'
                }`}
              />
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
          <div className="flex gap-1 justify-between">
            {[
              { label: 'Light', value: 10, emoji: '☀️' },
              { label: 'Auto', value: 30, emoji: '🌤️' },
              { label: 'Dim', value: 60, emoji: '🌙' },
              { label: 'Dark', value: 90, emoji: '🌑' }
            ].map((preset) => (
              <button
                key={preset.value}
                onClick={() => setDarknessLevel(preset.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all duration-200 hover:scale-105 ${
                  Math.abs(darknessLevel - preset.value) < 5
                    ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400'
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
                <span className="text-sm">{preset.emoji}</span>
                <span className="font-medium">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeControlBar;
