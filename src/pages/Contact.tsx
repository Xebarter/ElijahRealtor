import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin, User, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SEO from '@/components/common/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/lib/supabase';
import { sendContactNotification } from '@/services/notificationService';
import { toast } from 'react-hot-toast';
import { COUNTRIES } from '@/lib/allCountries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is too short').max(20, 'Phone number is too long'),
  country: z.string({ required_error: 'Please select a country.' }).min(1, 'Please select a country'),
  subject: z.string().min(2, 'Subject must be at least 2 characters').max(100, 'Subject must not exceed 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must not exceed 1000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface Office {
  id: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  mapQuery: string;
  lat: number;
  lng: number;
}

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeOffice, setActiveOffice] = useState<number>(0);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      country: '',
      subject: '',
      message: ''
    },
  });

  const watchCountry = form.watch('country');
  const selectedCountry = COUNTRIES.find((c) => c.name === watchCountry);
  const countryCode = selectedCountry ? selectedCountry.phoneCode : '';

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.from('contact_messages').insert({
        name: data.name,
        email: data.email,
        phone: `${countryCode}${data.phone}`,
        country: data.country,
        country_code: countryCode,
        subject: data.subject,
        message: data.message,
        created_at: new Date().toISOString(),
        status: 'new'
      });

      if (!error) {
        await sendContactNotification({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message
        });
      }

      if (error) throw error;
      
      setSubmitSuccess(true);
      form.reset();
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error sending message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Head Office',
      details: ['ABC Place, Waiyaki Way', 'Westlands, Nairobi, Kenya'],
      color: 'text-[#ffd51e]',
      bgColor: 'bg-[#ffd51e]/10'
    },
    {
      icon: Phone,
      title: 'Phone',
      details: [
        <a key="phone" href="tel:+256751077770" className="hover:underline">+256751077770</a>,
        'Mon - Fri: 9:00 - 18:00'
      ],
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@elijahrealtor.com', 'support@elijahrealtor.com'],
      color: 'text-red-400',
      bgColor: 'bg-red-400/10'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Monday - Friday: 9:00 - 18:00', 'Saturday: 10:00 - 15:00'],
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    }
  ];

  const socialLinks = [
    { 
      name: 'Instagram', 
      icon: Instagram, 
      href: 'https://www.instagram.com/elijah_realtor_pro/',
      label: 'Instagram' 
    },
    { 
      name: 'TikTok', 
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ), 
      href: 'https://www.tiktok.com/@elijahrealtorpro',
      label: 'TikTok' 
    },
    { 
      name: 'WhatsApp', 
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ), 
      href: 'https://wa.me/256751077770',
      label: 'WhatsApp' 
    }
  ];

  const offices: Office[] = [
    {
      id: 'nairobi',
      city: 'Nairobi',
      country: 'Kenya',
      address: 'ABC Place, Waiyaki Way, Westlands',
      phone: '+254 700 000000',
      email: 'nairobi@elijahrealtor.com',
      mapQuery: 'ABC+Place,+Waiyaki+Way,+Nairobi,+Kenya',
      lat: -1.2684,
      lng: 36.8121
    },
    {
      id: 'mombasa',
      city: 'Mombasa',
      country: 'Kenya',
      address: 'Nyali Centre, Mombasa Road',
      phone: '+254 700 000001',
      email: 'mombasa@elijahrealtor.com',
      mapQuery: 'Nyali+Centre,+Mombasa+Road,+Mombasa,+Kenya',
      lat: -4.0435,
      lng: 39.6682
    },
    {
      id: 'kigali',
      city: 'Kigali',
      country: 'Rwanda',
      address: 'Kigali Heights, KG 7 Ave',
      phone: '+250 700 000000',
      email: 'kigali@elijahrealtor.com',
      mapQuery: 'Kigali+Heights,+KG+7+Ave,+Kigali,+Rwanda',
      lat: -1.9501,
      lng: 30.0588
    },
    {
      id: 'dodoma',
      city: 'Dodoma',
      country: 'Tanzania',
      address: 'Nyerere Square, Central Business District',
      phone: '+255 700 000000',
      email: 'dodoma@elijahrealtor.com',
      mapQuery: 'Nyerere+Square,+Dodoma,+Tanzania',
      lat: -6.1629,
      lng: 35.7516
    }
  ];

  return (
    <>
      <SEO
        title="Contact Us | Elijah Realtor"
        description="Get in touch with Elijah Realtor. We have offices across Africa ready to help you with your real estate needs."
        keywords="contact real estate, property consultation, real estate agent, luxury homes, property investment, Africa real estate"
      />

      {/* Hero Section with Form Overlay */}
      <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[url('/images/dots-pattern.png')] bg-repeat"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/90 to-[#1a1a1a]/70"></div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contact Info */}
            <motion.div 
              className="text-white"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[#ffd51e] font-medium text-sm uppercase tracking-widest mb-4 inline-block">Get in Touch</span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-cinzel mb-6 leading-tight">
                Let's Find Your <span className="text-[#ffd51e]">Dream</span> Property
              </h1>
              <p className="text-lg text-gray-300 mb-10 max-w-xl">
                Our dedicated team is ready to assist you with all your real estate needs. 
                Contact us today to schedule a consultation or visit one of our offices.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {contactInfo.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div 
                      key={index}
                      className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-[#ffd51e]/30 transition-all duration-300"
                      whileHover={{ y: -5 }}
                    >
                      <div className={`w-12 h-12 ${item.bgColor} rounded-full flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                      <div className="space-y-1">
                        {item.details.map((detail, i) => (
                          <p key={i} className="text-gray-300 text-sm">{detail}</p>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h4 className="text-white font-medium mb-4">Connect With Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#ffd51e] hover:text-[#1a1a1a] text-white flex items-center justify-center transition-all duration-300"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-8 sm:p-10">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 font-cinzel">Send Us a Message</h2>
                  <p className="text-gray-600 mt-2">We'll get back to you within 24 hours</p>
                </div>

                {submitSuccess ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
                    <p className="text-gray-600">We'll get back to you soon.</p>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <Input
                                    className="pl-10 h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-[#ffd51e] focus:border-[#ffd51e]"
                                    placeholder="John Doe"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs mt-1" />
                            </FormItem>
                          )}
                        />

                        {/* Email Field */}
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <Input
                                    type="email"
                                    className="pl-10 h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-[#ffd51e] focus:border-[#ffd51e]"
                                    placeholder="your.email@example.com"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs mt-1" />
                            </FormItem>
                          )}
                        />

                        {/* Country Field */}
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Country</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select your country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {COUNTRIES.map((country) => (
                                    <SelectItem key={country.name} value={country.name}>
                                      {country.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-red-500 text-xs mt-1" />
                            </FormItem>
                          )}
                        />

                        {/* Phone Field */}
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Phone Number</FormLabel>
                              <div className="flex">
                                <div className="flex-shrink-0 z-10 inline-flex items-center px-4 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                                  {countryCode ? `+${countryCode}` : '--'}
                                </div>
                                <FormControl>
                                  <Input
                                    type="tel"
                                    className="rounded-l-none h-12 border-l-0 focus:ring-2 focus:ring-[#ffd51e] focus:border-[#ffd51e]"
                                    placeholder="700 000000"
                                    {...field}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage className="text-red-500 text-xs mt-1" />
                            </FormItem>
                          )}
                        />

                        {/* Subject Field */}
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel className="text-sm font-medium text-gray-700">Subject</FormLabel>
                              <FormControl>
                                <Input
                                  className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-[#ffd51e] focus:border-[#ffd51e]"
                                  placeholder="How can we help you?"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs mt-1" />
                            </FormItem>
                          )}
                        />

                        {/* Message Field */}
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel className="text-sm font-medium text-gray-700">Your Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us about your real estate needs..." 
                                  rows={5} 
                                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#ffd51e] focus:border-transparent resize-none"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs mt-1" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2 col-span-2">
                        <Button
                          type="submit"
                          className="w-full bg-[#ffd51e] hover:bg-[#e6c01d] text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors duration-300"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Office Locations Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-cinzel">Our Office Locations</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Visit us at any of our conveniently located offices across Africa
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {offices.map((office, index) => (
              <div 
                key={office.id} 
                className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer ${activeOffice === index ? 'ring-2 ring-[#ffd51e]' : ''}`}
                onClick={() => setActiveOffice(index)}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{office.city}, {office.country}</h3>
                <p className="text-gray-600 mb-4">{office.address}</p>
                <p className="text-sm text-gray-500">{office.phone}</p>
                <p className="text-sm text-gray-500">{office.email}</p>
              </div>
            ))}
          </div>

          {/* Map Section */}
          {offices[activeOffice] && (
            <div className="mt-12 rounded-xl overflow-hidden shadow-xl">
              <div className="aspect-w-16 aspect-h-9 w-full h-96">
                <iframe
                  className="w-full h-full"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${offices[activeOffice].mapQuery}&center=${offices[activeOffice].lat},${offices[activeOffice].lng}&zoom=15`}
                  allowFullScreen
                  aria-hidden="false"
                  tabIndex={0}
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Contact;
