
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface SuccessCheckmarkProps {
  show: boolean;
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({ 
  show, 
  onComplete, 
  size = 'md' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000); // Show for 2 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-scale-in">
        <div className={`${sizeClasses[size]} animate-checkmark`}>
          <Check className="w-full h-full" />
        </div>
        <span className="text-sm font-medium">Answer received!</span>
      </div>
    </div>
  );
};

export default SuccessCheckmark;
