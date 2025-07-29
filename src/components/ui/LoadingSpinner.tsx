import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner = ({ size = 'md' }: LoadingSpinnerProps) => {
  const [colorIndex, setColorIndex] = useState(0);
  const colors = ['bg-red-600', 'bg-[#ffd51e]', 'bg-black'];

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className={`relative ${sizeClasses[size]}`}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1/4 rounded-full ${
              colors[colorIndex]
            }`}
            style={{
              left: '50%',
              top: '50%',
              transform: `rotate(${i * 30}deg) translateY(-150%)`,
              animation: 'pulse 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
              transformOrigin: '50% 150%',
              opacity: 0.7,
            }}
          />
        ))}
      </div>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 0.3;
            }
            50% {
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};
