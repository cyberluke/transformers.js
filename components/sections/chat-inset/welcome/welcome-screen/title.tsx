import React from 'react';

interface WelcomeTitleProps {
  className?: string;
}

export function WelcomeTitle({ className }: WelcomeTitleProps) {
  return (
    <h1 className={`text-center font-medium text-shadow-emerald text-4xl md:text-5xl lg:text-6xl text-white ${className ?? ''}`}>
      Co se chcete dozvědět?
    </h1>
  );
}



