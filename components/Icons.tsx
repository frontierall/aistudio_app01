import React from 'react';

export const BikeIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Handlebars */}
    <path d="M4 14h16" strokeWidth="2.5" stroke="gray" />
    
    {/* Helmet/Head */}
    <circle cx="12" cy="12" r="9" fill="#FCD34D" stroke="none" /> 
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />

    {/* Helmet Shine */}
    <path d="M14 6a4 4 0 0 0-4 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />

    {/* Eyes */}
    <circle cx="9" cy="11" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11" r="1.5" fill="currentColor" stroke="none" />

    {/* Smile */}
    <path d="M10 15c.5 1 3.5 1 4 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const PizzaIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Crust */}
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" strokeOpacity="0.1" fill="currentColor" fillOpacity="0.1"/>
    
    {/* Slice */}
    <path d="M12 2L4 18h16L12 2z" fill="currentColor" fillOpacity="0.2" />
    
    {/* Pepperoni */}
    <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/>
    <circle cx="10" cy="12" r="1" fill="currentColor" stroke="none"/>
    <circle cx="14" cy="13" r="1" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

export const BoxIcon = ({ className, variant = 0 }: { className?: string, variant?: number }) => {
  // 4 different face types determined by modulo
  const faceType = variant % 4;

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      className={className}
    >
      {/* Box shape */}
      <rect x="3" y="3" width="18" height="18" rx="4" ry="4" fill="#FDBA74" strokeWidth="2" />
      
      {/* Tape */}
      <line x1="12" y1="3" x2="12" y2="21" stroke="#EA580C" strokeWidth="2" strokeOpacity="0.3" />

      {/* Faces */}
      <g transform="translate(0, 1)" fill="currentColor" stroke="none" opacity="0.8">
        {faceType === 0 && ( // Happy
          <>
            <circle cx="8" cy="10" r="1.5" />
            <circle cx="16" cy="10" r="1.5" />
            <path d="M9 14q3 2 6 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </>
        )}
        {faceType === 1 && ( // Winking
          <>
            <rect x="7" y="10" width="3" height="1" rx="0.5" />
            <circle cx="16" cy="10.5" r="1.5" />
            <path d="M10 14q2 1 4 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </>
        )}
        {faceType === 2 && ( // UwU
          <>
            <path d="M7 11c0-1 1.5-1 1.5 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M15 11c0-1 1.5-1 1.5 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M10 14c0 1 1 1 2 0c1 1 2 1 2 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </>
        )}
        {faceType === 3 && ( // Shocked/Cute
          <>
            <circle cx="8" cy="10" r="1.5" />
            <circle cx="16" cy="10" r="1.5" />
            <circle cx="12" cy="15" r="1.5" />
          </>
        )}
      </g>
      
      {/* Cheeks */}
      <circle cx="6" cy="12" r="1" fill="#FB7185" fillOpacity="0.5" stroke="none" />
      <circle cx="18" cy="12" r="1" fill="#FB7185" fillOpacity="0.5" stroke="none" />
    </svg>
  );
};