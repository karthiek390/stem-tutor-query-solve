
import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* AI-themed animated loader with sparkles */}
      <div className="absolute inset-0 animate-spin">
        <div className="w-full h-full rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500"></div>
      </div>
      
      {/* Central AI brain icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
      </div>
      
      {/* Sparkle effects */}
      <div className="absolute -top-1 -right-1 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
      <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};

export default Loader;
