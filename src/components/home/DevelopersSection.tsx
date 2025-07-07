import { useState, useEffect } from 'react';
import { Building } from 'lucide-react';
import { useDevelopers } from '@/hooks/useDevelopers';

const DevelopersSection = () => {
  const { developers } = useDevelopers();
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  // Filter developers with logos
  const developersWithLogos = developers.filter(dev => dev.logo_url);
  const firstFiveDevelopers = developersWithLogos.slice(0, 5);

  // Set up logo carousel animation
  useEffect(() => {
    if (developersWithLogos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentLogoIndex(prevIndex => 
        prevIndex === developersWithLogos.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change logo every 3 seconds
    
    return () => clearInterval(interval);
  }, [developersWithLogos.length]);

  if (developersWithLogos.length === 0) {
    return null; // Don't render the section if no developers with logos
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-navy mb-4">
            Our Trusted Development Partners
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We work with leading property developers across East Africa to bring you the finest real estate opportunities
          </p>
        </div>

        {/* Developer Logos Row and Carousel */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Row of up to 5 developer logos */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {firstFiveDevelopers.map((developer) => (
              <div key={developer.id} className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-white shadow-lg border-2 border-gray-200 flex items-center justify-center mb-3">
                  <img
                    src={developer.logo_url}
                    alt={developer.name}
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/96x96?text=Logo';
                    }}
                  />
                </div>
                <p className="text-base font-medium text-gray-700">{developer.name}</p>
              </div>
            ))}
          </div>

          {/* Animated carousel for the rest */}
          {developersWithLogos.length > 5 && (
            <div className="relative h-40 overflow-hidden">
              <div className="flex justify-center items-center h-full">
                {developersWithLogos.slice(5).map((developer, index) => (
                  <div
                    key={developer.id}
                    className={`absolute transition-all duration-1000 transform ${
                      index === currentLogoIndex
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95'
                    }`}
                    style={{
                      zIndex: index === currentLogoIndex ? 10 : 1
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-white shadow-lg border-2 border-gray-200 flex items-center justify-center mb-3">
                        <img
                          src={developer.logo_url}
                          alt={developer.name}
                          className="w-24 h-24 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/96x96?text=Logo';
                          }}
                        />
                      </div>
                      <p className="text-base font-medium text-gray-700">{developer.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logo Navigation Dots for carousel */}
          {developersWithLogos.length > 6 && (
            <div className="flex justify-center mt-4 space-x-2">
              {developersWithLogos.slice(5).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentLogoIndex ? 'bg-primary-gold' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentLogoIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DevelopersSection; 