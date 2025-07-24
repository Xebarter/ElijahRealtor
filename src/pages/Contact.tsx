import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import SEO from '@/components/common/SEO';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ContactForm from '@/components/common/ContactForm';

const Contact = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Head Office',
      details: ['ABC Place, Waiyaki Way', 'Westlands, Nairobi, Kenya'],
    },
    {
      icon: Phone,
      title: 'Phone Numbers',
      details: ['+254 700 123 456', '+256 700 123 456', '+255 700 123 456'],
    },
    {
      icon: Mail,
      title: 'Email Addresses',
      details: ['info@elijahrealtor.com', 'sales@elijahrealtor.com'],
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: [
        'Monday - Friday: 8:00 AM - 6:00 PM',
        'Saturday: 9:00 AM - 4:00 PM',
        'Sunday: Closed',
      ],
    },
  ];

  const offices = [
    {
      country: 'Kenya',
      city: 'Nairobi',
      address: 'ABC Place, Waiyaki Way, Westlands',
      phone: '+254 700 123 456',
      email: 'nairobi@elijahrealtor.com',
      mapQuery: 'ABC+Place+Waiyaki+Way+Nairobi+Kenya',
    },
    {
      country: 'Uganda',
      city: 'Kampala',
      address: 'Plot 123, Kololo Hill Road',
      phone: '+256 700 123 456',
      email: 'kampala@elijahrealtor.com',
      mapQuery: 'Plot+123+Kololo+Hill+Road+Kampala+Uganda',
    },
    {
      country: 'Tanzania',
      city: 'Dar es Salaam',
      address: 'Msimbazi Street, Upanga',
      phone: '+255 700 123 456',
      email: 'daressalaam@elijahrealtor.com',
      mapQuery: 'Msimbazi+Street+Upanga+Dar+es+Salaam+Tanzania',
    },
    {
      country: 'Nigeria',
      city: 'Lagos',
      address: 'Victoria Island, Lagos State',
      phone: '+234 700 123 456',
      email: 'lagos@elijahrealtor.com',
      mapQuery: 'Victoria+Island+Lagos+Nigeria',
    },
  ];

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with ElijahRealtor. We have offices across East Africa and West Africa ready to help you with your real estate needs."
        keywords="contact ElijahRealtor, real estate offices, property consultation, East Africa, West Africa"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">Contact Us</h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Ready to find your dream property? Get in touch with our expert team across Africa.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <ContactForm />
            </div>

            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-gold text-white">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{info.title}</h3>
                        <div className="mt-1 space-y-1">
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-base text-gray-600 dark:text-gray-400">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Our Office Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {offices.map((office, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            <MapPin className="w-6 h-6 text-primary-gold" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {office.city}, {office.country}
                            </h4>
                            <p className="text-base text-gray-600 dark:text-gray-400 mb-2">{office.address}</p>
                            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0 text-sm">
                              <a
                                href={`tel:${office.phone}`}
                                className="text-gray-800 dark:text-gray-300 hover:text-primary-gold dark:hover:text-primary-gold transition-colors duration-300 flex items-center"
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                {office.phone}
                              </a>
                              <a
                                href={`mailto:${office.email}`}
                                className="text-gray-800 dark:text-gray-300 hover:text-primary-gold dark:hover:text-primary-gold transition-colors duration-300 flex items-center"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                {office.email}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Find Us On The Map</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="w-full h-96">
                    <iframe
                      title="Elijah Realtor Office Locations"
                      src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${offices[0].mapQuery}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      aria-hidden="false"
                      tabIndex={0}
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
