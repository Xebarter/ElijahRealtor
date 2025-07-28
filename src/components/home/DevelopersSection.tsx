import { useState, useEffect, useRef } from 'react';
import { useDevelopers } from '@/hooks/useDevelopers';

const DevelopersSection = () => {
  const { developers } = useDevelopers();
  const [translateX, setTranslateX] = useState(0);
  const animationRef = useRef<number | null>(null);

  let developersWithLogos = developers.filter(dev => dev.logo_url);

  // Ensure enough logos for looping
  if (developersWithLogos.length > 0 && developersWithLogos.length < 10) {
    const repeatCount = Math.ceil(10 / developersWithLogos.length);
    developersWithLogos = Array(repeatCount).fill(developersWithLogos).flat();
  }

  // Responsive logo width
  const getLogoWidth = () => {
    if (typeof window === 'undefined') return 160;
    if (window.innerWidth < 640) return 120;
    if (window.innerWidth < 1024) return 140;
    return 160;
  };

  const [logoWidth, setLogoWidth] = useState(getLogoWidth());
  const SPEED = 0.5;

  useEffect(() => {
    const handleResize = () => setLogoWidth(getLogoWidth());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (developersWithLogos.length === 0) return;

    const animate = () => {
      setTranslateX(prev => {
        const resetPoint = -(developersWithLogos.length / 2) * logoWidth;
        return prev <= resetPoint ? 0 : prev - SPEED;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [developersWithLogos.length, logoWidth]);

  if (developersWithLogos.length === 0) return null;

  const doubledLogos = [...developersWithLogos, ...developersWithLogos];

  return (
    <section className="py-6 sm:py-10 md:py-16 bg-white overflow-x-hidden font-luxury">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');

        .font-luxury {
          font-family: 'Cinzel', serif;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-navy mb-2 clamp-text">
            Our Trusted Development Partners
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-xl mx-auto clamp-text">
            We work with leading property developers across Africa<br className="hidden sm:block" />
            to bring you the finest real estate opportunities
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-6 lg:p-8 relative w-full overflow-hidden" style={{ height: `${logoWidth + 60}px` }}>
          <div
            className="absolute top-0 left-0 flex items-center"
            style={{
              transform: `translateX(${translateX}px)`,
              width: `${doubledLogos.length * logoWidth}px`,
              willChange: 'transform',
            }}
          >
            {doubledLogos.map((developer, idx) => (
              <div
                key={`${developer.id}-${idx}`}
                className="flex flex-col items-center flex-shrink-0 px-1 sm:px-3 lg:px-4"
                style={{ width: `${logoWidth}px` }}
              >
                <div className="w-12 h-12 sm:w-20 sm:h-20 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-white shadow-lg border-2 border-gray-200 flex items-center justify-center mb-1 sm:mb-3">
                  <img
                    src={developer.logo_url}
                    alt={developer.name}
                    className="w-10 h-10 sm:w-16 sm:h-16 lg:w-24 lg:h-24 object-contain"
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
    </section>
  );
};

export default DevelopersSection;