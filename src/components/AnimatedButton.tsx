
import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';

interface AnimatedButtonProps extends ButtonProps {
  isLoading?: boolean;
  pulseOnHover?: boolean;
  scaleOnHover?: boolean;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    children, 
    className = '', 
    isLoading = false, 
    pulseOnHover = false,
    scaleOnHover = true,
    disabled,
    ...props 
  }, ref) => {
    const animationClasses = `
      transition-all duration-200 ease-out
      ${scaleOnHover && !disabled ? 'hover:scale-105' : ''}
      ${pulseOnHover && !disabled ? 'hover:animate-pulse' : ''}
      active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed
      ${isLoading ? 'animate-pulse' : ''}
    `;

    return (
      <Button
        ref={ref}
        className={`${animationClasses} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;
