import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SEO from '@/components/common/SEO';
import { contactSchema } from '@/lib/validations';
import { supabase } from '@/lib/supabase';
import { COUNTRIES } from '@/lib/countries';
import type { ContactForm } from '@/types';
import type { z } from 'zod';

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const watchCountry = watch('country');

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          country: data.country,
          subject: data.subject,
          message: data.message,
          status: 'new'
        });

      if (error) throw error;
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message. Please try again.');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      details: ['Monday - Friday: 8:00 AM - 6:00 PM', 'Saturday: 9:00 AM - 4:00 PM', 'Sunday: Closed'],
    },
  ];

  const offices = [
    {
      country: 'Kenya',
      city: 'Nairobi',
      address: 'ABC Place, Waiyaki Way, Westlands',
      phone: '+254 700 123 456',
      email: 'nairobi@elijahrealtor.com',
    },
    {
      country: 'Uganda',
      city: 'Kampala',
      address: 'Plot 123, Kololo Hill Road',
      phone: '+256 700 123 456',
      email: 'kampala@elijahrealtor.com',
    },
    {
      country: 'Tanzania',
      city: 'Dar es Salaam',
      address: 'Msimbazi Street, Upanga',
      phone: '+255 700 123 456',
      email: 'daressalaam@elijahrealtor.com',
    },
    {
      country: 'Nigeria',
      city: 'Lagos',
      address: 'Victoria Island, Lagos State',
      phone: '+234 700 123 456',
      email: 'lagos@elijahrealtor.com',
    },
  ];

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with ElijahRealtor. We have offices across East Africa and West Africa ready to help you with your real estate needs."
        keywords="contact ElijahRealtor, real estate offices, property consultation, East Africa, West Africa"
      />

      <div className="min-h-screen bg-bg-primary">
        {/* Hero Section */}
        <div className="bg-primary-navy text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Ready to find your dream property? Get in touch with our expert team across Africa.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Send className="w-5 h-5 mr-2 text-primary-gold" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <Input
                          {...register('name')}
                          placeholder="Enter your full name"
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          {...register('email')}
                          placeholder="Enter your email"
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <Input
                          type="tel"
                          {...register('phone')}
                          placeholder="Enter your phone number"
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <Select
                          value={watchCountry}
                          onValueChange={(value) => setValue('country', value)}
                        >
                          <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.code} value={country.name}>
                                {country.flag} {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.country && (
                          <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <Input
                        {...register('subject')}
                        placeholder="What is this regarding?"
                        className={errors.subject ? 'border-red-500' : ''}
                      />
                      {errors.subject && (
                        <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                      </label>
                      <Textarea
                        {...register('message')}
                        placeholder="Tell us how we can help you..."
                        rows={5}
                        className={errors.message ? 'border-red-500' : ''}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Quick Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <Card key={index}>
                      <CardContent className="p-6 text-center">
                        <Icon className="w-8 h-8 text-primary-gold mx-auto mb-3" />
                        <h3 className="font-semibold text-primary-navy mb-2">{info.title}</h3>
                        <div className="space-y-1">
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-sm text-gray-600">{detail}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Office Locations */}
              <Card>
                <CardHeader>
                  <CardTitle>Our Office Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {offices.map((office, index) => (
                      <div key={index} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <MapPin className="w-4 h-4 text-primary-gold" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-primary-navy">
                              {office.city}, {office.country}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">{office.address}</p>
                            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0 text-sm">
                              <a 
                                href={`tel:${office.phone}`}
                                className="text-primary-navy hover:text-primary-gold flex items-center"
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                {office.phone}
                              </a>
                              <a 
                                href={`mailto:${office.email}`}
                                className="text-primary-navy hover:text-primary-gold flex items-center"
                              >
                                <Mail className="w-3 h-3 mr-1" />
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

              {/* Map Placeholder */}
              <Card>
                <CardContent className="p-0">
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Interactive map coming soon</p>
                      <p className="text-sm text-gray-400">Showing all office locations</p>
                    </div>
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