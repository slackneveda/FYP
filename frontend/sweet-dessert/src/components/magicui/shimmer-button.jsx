import React from 'react';
import { cn } from '@/lib/utils';

const ShimmerButton = React.forwardRef(({ 
  className, 
  children, 
  variant = 'default',
  size = 'default',
  ...props 
}, ref) => {
  
  const variants = {
    default: 'bg-[linear-gradient(110deg,var(--primary)_45%,var(--primary-light)_55%,var(--primary))] hover:bg-[linear-gradient(110deg,var(--primary-light)_45%,var(--primary)_55%,var(--primary-light))] text-white',
    caramel: 'bg-[linear-gradient(110deg,#D2691E_45%,#FF8C00_55%,#D2691E)] hover:bg-[linear-gradient(110deg,#FF8C00_45%,#D2691E_55%,#FF8C00)] text-white',
    chocolate: 'bg-[linear-gradient(110deg,#993809_45%,#7B2D05_55%,#993809)] hover:bg-[linear-gradient(110deg,#7B2D05_45%,#993809_55%,#7B2D05)] text-white',
    strawberry: 'bg-[linear-gradient(110deg,#FFB6C1_45%,#FF69B4_55%,#FFB6C1)] hover:bg-[linear-gradient(110deg,#FF69B4_45%,#FFB6C1_55%,#FF69B4)] text-gray-800',
    mint: 'bg-[linear-gradient(110deg,#98FB98_45%,#00FA9A_55%,#98FB98)] hover:bg-[linear-gradient(110deg,#00FA9A_45%,#98FB98_55%,#00FA9A)] text-gray-800'
  };

  const sizes = {
    sm: 'h-8 px-4 text-xs',
    default: 'h-10 px-6 text-sm',
    lg: 'h-12 px-8 text-base',
    xl: 'h-14 px-10 text-lg'
  };

  return (
    <button
      className={cn(
        'inline-flex animate-shimmer items-center justify-center rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-50 bg-[length:200%_100%] shadow-lg hover:shadow-xl transform hover:scale-105',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

ShimmerButton.displayName = 'ShimmerButton';

export { ShimmerButton };