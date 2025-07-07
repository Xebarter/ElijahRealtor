import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

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
            return (
              <Card 
                key={service.title} 
                className="card-hover bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
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