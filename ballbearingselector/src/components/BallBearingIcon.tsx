import React from 'react';

interface BallBearingIconProps {
  className?: string;
  size?: number;
}

export const BallBearingIcon: React.FC<BallBearingIconProps> = ({
  className = 'w-5 h-5',
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ball Bearing Logo"
    >
      {/* Outer Ring */}
      <circle
        cx="12"
        cy="12"
        r="10.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeOpacity="0.4"
      />

      {/* Inner Ring */}
      <circle
        cx="12"
        cy="12"
        r="5.4"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeOpacity="0.4"
      />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      {/* Shaft Center Hole */}
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="currentColor"
        fillOpacity="0.25"
      />

      {/* Cage Pitch Circle Track */}
      <circle
        cx="12"
        cy="12"
        r="7.2"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeDasharray="2 1.5"
        strokeOpacity="0.5"
      />

      {/* 8 Precision Rolling Element Balls */}
      {/* 0° */}
      <circle cx="19.2" cy="12" r="1.6" fill="currentColor" />
      {/* 45° */}
      <circle cx="17.09" cy="17.09" r="1.6" fill="currentColor" />
      {/* 90° */}
      <circle cx="12" cy="19.2" r="1.6" fill="currentColor" />
      {/* 135° */}
      <circle cx="6.91" cy="17.09" r="1.6" fill="currentColor" />
      {/* 180° */}
      <circle cx="4.8" cy="12" r="1.6" fill="currentColor" />
      {/* 225° */}
      <circle cx="6.91" cy="6.91" r="1.6" fill="currentColor" />
      {/* 270° */}
      <circle cx="12" cy="4.8" r="1.6" fill="currentColor" />
      {/* 315° */}
      <circle cx="17.09" cy="6.91" r="1.6" fill="currentColor" />
    </svg>
  );
};
