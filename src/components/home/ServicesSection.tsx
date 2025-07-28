import { Card, CardContent } from '../../components/ui/card';
import { useEffect } from 'react';

const ServicesSection = () => {
  const services = [
    {
      title: 'Property Sales',
      description: 'Expert guidance in buying and selling residential and commercial properties with maximum value.',
    },
    {
      title: 'Investment Advisory',
      description: 'Strategic property investment advice to help you build wealth through real estate.',
    },
    {
      title: 'Property Management',
      description: 'Comprehensive property management services to maximize your rental income and property value.',
    },
    {
      title: 'Client Support',
      description: '24/7 dedicated support throughout your property journey with personalized service.',
    },
    {
      title: 'Commercial Properties',
      description: 'Specialized expertise in commercial real estate for businesses and investors.',
    },
    {
      title: 'Valued Customer',
      description: 'Our commitment to excellence ensures every client receives exceptional service and results.',
    },
  ];

  useEffect(() => {
    const font = document.createElement('link');
    font.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap';
    font.rel = 'stylesheet';
    document.head.appendChild(font);
  }, []);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-[Cinzel]">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-amber-300 mb-4 tracking-wider leading-snug">
            Why Choose ElijahRealtor
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We provide comprehensive real estate services with a commitment to excellence,
            integrity, and client satisfaction.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 md:gap-10">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className="bg-gray-800/50 border border-amber-600 rounded-3xl shadow-md hover:shadow-xl transition duration-300 ease-in-out hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-5 sm:p-6 md:p-8 text-center">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-amber-200 mb-3 tracking-wide leading-tight">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
