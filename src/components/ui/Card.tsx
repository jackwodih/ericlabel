'use client';

import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export function Card({ 
  children, 
  hover = false, 
  glass = false,
  className, 
  ...props 
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl p-6',
        glass 
          ? 'bg-white/70 backdrop-blur-md border border-white/20 shadow-xl'
          : 'bg-white border border-gray-200 shadow-lg',
        hover && 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}