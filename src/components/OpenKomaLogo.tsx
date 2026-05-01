import React from 'react';

export function OpenKomaLogo({ size = 48, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Accent Teal Box */}
      <path 
        d="M 60 74 H 34 C 21.85 74 12 64.15 12 52 V 34 C 12 21.85 21.85 12 34 12 H 68 C 80.15 12 90 21.85 90 34 V 46" 
        stroke="#6AC4B8" 
        strokeWidth="11" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Primary/White Comma and Dots */}
      <g fill="currentColor">
        <circle cx="33" cy="45" r="6" />
        <circle cx="51" cy="45" r="6" />
        <circle cx="69" cy="45" r="6" />
        {/* Comma Tail */}
        <path d="M 88 64 C 88 54.163 80.837 47 72 47 C 63.163 47 56 54.163 56 64 C 56 69.467 58.75 74.291 63.05 77.014 C 61 82 56.5 86 52 88 C 58 90.5 66 89.5 73.5 83 C 80 77.5 88 71 88 64 Z" />
      </g>
    </svg>
  );
}
