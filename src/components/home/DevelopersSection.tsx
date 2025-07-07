import { useState, useEffect, useRef } from 'react';
import { useDevelopers } from '@/hooks/useDevelopers';

const DevelopersSection = () => {
  const { developers } = useDevelopers();
  const [translateX, setTranslateX] = useState(0);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  let developersWithLogos = developers.filter(dev => dev.logo_url);
  
  // Ensure we have enough logos for smooth infinite scrolling
  if (developersWithLogos.length > 0 && developersWithLogos.length < 10) {
    const repeatCount = Math.ceil(10 / developersWithLogos.length);
    developersWithLogos = Array(repeatCount).fill(developersWithLogos).flat();
  }

  // Animation constants - responsive
  const getLogoWidth = () => {
    if (typeof window === 'undefined') return 160;
    if (window.innerWidth < 640) return 120; // Mobile
    if (window.innerWidth < 1024) return 140; // Tablet
    return 160; // Desktop
  };
  
  const [logoWidth, setLogoWidth] = useState(getLogoWidth());
  const SPEED = 0.5; // Pixels per frame (adjust for speed)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setLogoWidth(getLogoWidth());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (developersWithLogos.length === 0) return;

    const animate = () => {
      setTranslateX(prev => {
        const newTranslateX = prev - SPEED;
        
        // Reset position when we've moved one full set of logos
        const resetPoint = -(developersWithLogos.length / 2) * logoWidth;
        
        if (newTranslateX <= resetPoint) {
          return 0;
        }
        
        return newTranslateX;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [developersWithLogos.length, logoWidth]);

  if (developersWithLogos.length === 0) {
    return null;
  }

  // Create double array for seamless loop
  const doubledLogos = [...developersWithLogos, ...developersWithLogos];

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-navy mb-3 sm:mb-4 px-4">
            Our Trusted Development Partners
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            We work with leading property developers across East Africa to bring you the finest real estate opportunities
          </p>
        </div>

        {/* Developer Logos Endless Loop */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
          <div 
            ref={containerRef}
            className="overflow-hidden w-full"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, white 10%, white 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, white 10%, white 90%, transparent)'
            }}
          >
            <div
              className="flex items-center"
              style={{
                transform: `translateX(${translateX}px)`,
                width: `${doubledLogos.length * logoWidth}px`
              }}
            >
              {doubledLogos.map((developer, idx) => (
                <div
                  key={`${developer.id}-${idx}`}
                  className="flex flex-col items-center flex-shrink-0 px-2 sm:px-3 lg:px-4"
                  style={{ width: `${logoWidth}px` }}
                >
                  <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-white shadow-lg border-2 border-gray-200 flex items-center justify-center mb-2 sm:mb-3">
                    <img
                      src={developer.logo_url}
                      alt={developer.name}
                      className="w-12 h-12 sm:w-18 sm:h-18 lg:w-24 lg:h-24 object-contain"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/96x96?text=Logo';
                      }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-700 text-center px-1 sm:px-2 leading-tight">
                    {developer.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DevelopersSection;