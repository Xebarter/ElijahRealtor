import { useState, useEffect } from 'react';
import { Home, TrendingUp, Shield, Users, Building, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDevelopers } from '@/hooks/useDevelopers';

const ServicesSection = () => {
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

  const services = [
    {
      icon: Home,
      title: 'Property Sales',
      description: 'Expert guidance in buying and selling residential and commercial properties with maximum value.',
    },
    {
      icon: TrendingUp,
      title: 'Investment Advisory',
      description: 'Strategic property investment advice to help you build wealth through real estate.',
    },
    {
      icon: Shield,
      title: 'Property Management',
      description: 'Comprehensive property management services to maximize your rental income and property value.',
    },
    {
      icon: Users,
      title: 'Client Support',
      description: '24/7 dedicated support throughout your property journey with personalized service.',
    },
    {
      icon: Building,
      title: 'Commercial Properties',
      description: 'Specialized expertise in commercial real estate for businesses and investors.',
    },
    {
      icon: Heart,
      title: 'Customer Satisfaction',
      description: 'Our commitment to excellence ensures every client receives exceptional service and results.',
    },
  ];

  return (
    <section className="py-16 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-navy mb-4">
            Why Choose ElijahRealtor
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive real estate services with a commitment to excellence, 
            integrity, and client satisfaction
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={service.title} 
                className="card-hover bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary-navy mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Developer Logos Row and Carousel */}
        {developersWithLogos.length > 0 && (
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-primary-navy mb-6 text-center">
              Our Trusted Development Partners
            </h3>

            {/* Row of up to 5 developer logos */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              {firstFiveDevelopers.map((developer) => (
                <div key={developer.id} className="flex flex-col items-center">
                  <img
                    src={developer.logo_url}
                    alt={developer.name}
                    className="h-24 w-40 object-contain mx-auto drop-shadow-lg bg-white rounded-lg border border-gray-200"
                    style={{ maxWidth: 180 }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/180x96?text=Logo';
                    }}
                  />
                  <p className="text-base font-medium text-gray-700 mt-2">{developer.name}</p>
                </div>
              ))}
            </div>

            {/* Animated carousel for the rest */}
            {developersWithLogos.length > 5 && (
              <div className="relative h-36 overflow-hidden">
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
                        <img
                          src={developer.logo_url}
                          alt={developer.name}
                          className="h-24 w-40 object-contain mx-auto drop-shadow-lg bg-white rounded-lg border border-gray-200"
                          style={{ maxWidth: 180 }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/180x96?text=Logo';
                          }}
                        />
                        <p className="text-base font-medium text-gray-700 mt-2">{developer.name}</p>
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
        )}

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-navy mb-2">500+</div>
              <div className="text-gray-600">Properties Sold</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-navy mb-2">98%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-navy mb-2">15+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-navy mb-2">50+</div>
              <div className="text-gray-600">Locations Covered</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;