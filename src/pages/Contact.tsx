import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SEO from '@/components/common/SEO';
import { supabase } from '../lib/supabase'; // Verify this path
import { toast } from 'react-hot-toast';

// Define form schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is too short').max(20, 'Phone number is too long'),
  country: z.string().min(1, 'Please select a country'),
  subject: z.string().min(2, 'Subject must be at least 2 characters').max(100, 'Subject must not exceed 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must not exceed 1000 characters'),
});

// Define form data type
type ContactFormData = z.infer<typeof contactSchema>;

// Comprehensive country list with phone codes
const COUNTRIES = [
  { name: 'Afghanistan', phoneCode: '+93' },
  { name: 'Albania', phoneCode: '+355' },
  { name: 'Algeria', phoneCode: '+213' },
  { name: 'Andorra', phoneCode: '+376' },
  { name: 'Angola', phoneCode: '+244' },
  { name: 'Antigua and Barbuda', phoneCode: '+1-268' },
  { name: 'Argentina', phoneCode: '+54' },
  { name: 'Armenia', phoneCode: '+374' },
  { name: 'Australia', phoneCode: '+61' },
  { name: 'Austria', phoneCode: '+43' },
  { name: 'Azerbaijan', phoneCode: '+994' },
  { name: 'Bahamas', phoneCode: '+1-242' },
  { name: 'Bahrain', phoneCode: '+973' },
  { name: 'Bangladesh', phoneCode: '+880' },
  { name: 'Barbados', phoneCode: '+1-246' },
  { name: 'Belarus', phoneCode: '+375' },
  { name: 'Belgium', phoneCode: '+32' },
  { name: 'Belize', phoneCode: '+501' },
  { name: 'Benin', phoneCode: '+229' },
  { name: 'Bhutan', phoneCode: '+975' },
  { name: 'Bolivia', phoneCode: '+591' },
  { name: 'Bosnia and Herzegovina', phoneCode: '+387' },
  { name: 'Botswana', phoneCode: '+267' },
  { name: 'Brazil', phoneCode: '+55' },
  { name: 'Brunei', phoneCode: '+673' },
  { name: 'Bulgaria', phoneCode: '+359' },
  { name: 'Burkina Faso', phoneCode: '+226' },
  { name: 'Burundi', phoneCode: '+257' },
  { name: 'Cambodia', phoneCode: '+855' },
  { name: 'Cameroon', phoneCode: '+237' },
  { name: 'Canada', phoneCode: '+1' },
  { name: 'Cape Verde', phoneCode: '+238' },
  { name: 'Central African Republic', phoneCode: '+236' },
  { name: 'Chad', phoneCode: '+235' },
  { name: 'Chile', phoneCode: '+56' },
  { name: 'China', phoneCode: '+86' },
  { name: 'Colombia', phoneCode: '+57' },
  { name: 'Comoros', phoneCode: '+269' },
  { name: 'Congo (DRC)', phoneCode: '+243' },
  { name: 'Congo (Republic)', phoneCode: '+242' },
  { name: 'Costa Rica', phoneCode: '+506' },
  { name: "Côte d'Ivoire", phoneCode: '+225' },
  { name: 'Croatia', phoneCode: '+385' },
  { name: 'Cuba', phoneCode: '+53' },
  { name: 'Cyprus', phoneCode: '+357' },
  { name:

 'Czech Republic', phoneCode: '+420' },
  { name: 'Denmark', phoneCode: '+45' },
  { name: 'Djibouti', phoneCode: '+253' },
  { name: 'Dominica', phoneCode: '+1-767' },
  { name: 'Dominican Republic', phoneCode: '+1-809' },
  { name: 'Ecuador', phoneCode: '+593' },
  { name: 'Egypt', phoneCode: '+20' },
  { name: 'El Salvador', phoneCode: '+503' },
  { name: 'Equatorial Guinea', phoneCode: '+240' },
  { name: 'Eritrea', phoneCode: '+291' },
  { name: 'Estonia', phoneCode: '+372' },
  { name: 'Eswatini', phoneCode: '+268' },
  { name: 'Ethiopia', phoneCode: '+251' },
  { name: 'Fiji', phoneCode: '+679' },
  { name: 'Finland', phoneCode: '+358' },
  { name: 'France', phoneCode: '+33' },
  { name: 'Gabon', phoneCode: '+241' },
  { name: 'Gambia', phoneCode: '+220' },
  { name: 'Georgia', phoneCode: '+995' },
  { name: 'Germany', phoneCode: '+49' },
  { name: 'Ghana', phoneCode: '+233' },
  { name: 'Greece', phoneCode: '+30' },
  { name: 'Grenada', phoneCode: '+1-473' },
  { name: 'Guatemala', phoneCode: '+502' },
  { name: 'Guinea', phoneCode: '+224' },
  { name: 'Guinea-Bissau', phoneCode: '+245' },
  { name: 'Guyana', phoneCode: '+592' },
  { name: 'Haiti', phoneCode: '+509' },
  { name: 'Honduras', phoneCode: '+504' },
  { name: 'Hungary', phoneCode: '+36' },
  { name: 'Iceland', phoneCode: '+354' },
  { name: 'India', phoneCode: '+91' },
  { name: 'Indonesia', phoneCode: '+62' },
  { name: 'Iran', phoneCode: '+98' },
  { name: 'Iraq', phoneCode: '+964' },
  { name: 'Ireland', phoneCode: '+353' },
  { name: 'Israel', phoneCode: '+972' },
  { name: 'Italy', phoneCode: '+39' },
  { name: 'Jamaica', phoneCode: '+1-876' },
  { name: 'Japan', phoneCode: '+81' },
  { name: 'Jordan', phoneCode: '+962' },
  { name: 'Kazakhstan', phoneCode: '+7' },
  { name: 'Kenya', phoneCode: '+254' },
  { name: 'Kiribati', phoneCode: '+686' },
  { name: 'Kuwait', phoneCode: '+965' },
  { name: 'Kyrgyzstan', phoneCode: '+996' },
  { name: 'Laos', phoneCode: '+856' },
  { name: 'Latvia', phoneCode: '+371' },
  { name: 'Lebanon', phoneCode: '+961' },
  { name: 'Lesotho', phoneCode: '+266' },
  { name: 'Liberia', phoneCode: '+231' },
  { name: 'Libya', phoneCode: '+218' },
  { name: 'Liechtenstein', phoneCode: '+423' },
  { name: 'Lithuania', phoneCode: '+370' },
  { name: 'Luxembourg', phoneCode: '+352' },
  { name: 'Madagascar', phoneCode: '+261' },
  { name: 'Malawi', phoneCode: '+265' },
  { name: 'Malaysia', phoneCode: '+60' },
  { name: 'Maldives', phoneCode: '+960' },
  { name: 'Mali', phoneCode: '+223' },
  { name: 'Malta', phoneCode: '+356' },
  { name: 'Marshall Islands', phoneCode: '+692' },
  { name: 'Mauritania', phoneCode: '+222' },
  { name: 'Mauritius', phoneCode: '+230' },
  { name: 'Mexico', phoneCode: '+52' },
  { name: 'Micronesia', phoneCode: '+691' },
  { name: 'Moldova', phoneCode: '+373' },
  { name: 'Monaco', phoneCode: '+377' },
  { name: 'Mongolia', phoneCode: '+976' },
  { name: 'Montenegro', phoneCode: '+382' },
  { name: 'Morocco', phoneCode: '+212' },
  { name: 'Mozambique', phoneCode: '+258' },
  { name: 'Myanmar', phoneCode: '+95' },
  { name: 'Namibia', phoneCode: '+264' },
  { name: 'Nauru', phoneCode: '+674' },
  { name: 'Nepal', phoneCode: '+977' },
  { name: 'Netherlands', phoneCode: '+31' },
  { name: 'New Zealand', phoneCode: '+64' },
  { name: 'Nicaragua', phoneCode: '+505' },
  { name: 'Niger', phoneCode: '+227' },
  { name: 'Nigeria', phoneCode: '+234' },
  { name: 'North Korea', phoneCode: '+850' },
  { name: 'North Macedonia', phoneCode: '+389' },
  { name: 'Norway', phoneCode: '+47' },
  { name: 'Oman', phoneCode: '+968' },
  { name: 'Pakistan', phoneCode: '+92' },
  { name: 'Palau', phoneCode: '+680' },
  { name: 'Panama', phoneCode: '+507' },
  { name: 'Papua New Guinea', phoneCode: '+675' },
  { name: 'Paraguay', phoneCode: '+595' },
  { name: 'Peru', phoneCode: '+51' },
  { name: 'Philippines', phoneCode: '+63' },
  { name: 'Poland', phoneCode: '+48' },
  { name: 'Portugal', phoneCode: '+351' },
  { name: 'Qatar', phoneCode: '+974' },
  { name: 'Romania', phoneCode: '+40' },
  { name: 'Russia', phoneCode: '+7' },
  { name: 'Rwanda', phoneCode: '+250' },
  { name: 'Saint Kitts and Nevis', phoneCode: '+1-869' },
  { name: 'Saint Lucia', phoneCode: '+1-758' },
  { name: 'Saint Vincent and the Grenadines', phoneCode: '+1-784' },
  { name: 'Samoa', phoneCode: '+685' },
  { name: 'San Marino', phoneCode: '+378' },
  { name: 'Sao Tome and Principe', phoneCode: '+239' },
  { name: 'Saudi Arabia', phoneCode: '+966' },
  { name: 'Senegal', phoneCode: '+221' },
  { name: 'Serbia', phoneCode: '+381' },
  { name: 'Seychelles', phoneCode: '+248' },
  { name: 'Sierra Leone', phoneCode: '+232' },
  { name: 'Singapore', phoneCode: '+65' },
  { name: 'Slovakia', phoneCode: '+421' },
  { name: 'Slovenia', phoneCode: '+386' },
  { name: 'Solomon Islands', phoneCode: '+677' },
  { name: 'Somalia', phoneCode: '+252' },
  { name: 'South Africa', phoneCode: '+27' },
  { name: 'South Korea', phoneCode: '+82' },
  { name: 'South Sudan', phoneCode: '+211' },
  { name: 'Spain', phoneCode: '+34' },
  { name: 'Sri Lanka', phoneCode: '+94' },
  { name: 'Sudan', phoneCode: '+249' },
  { name: 'Suriname', phoneCode: '+597' },
  { name: 'Sweden', phoneCode: '+46' },
  { name: 'Switzerland', phoneCode: '+41' },
  { name: 'Syria', phoneCode: '+963' },
  { name: 'Taiwan', phoneCode: '+886' },
  { name: 'Tajikistan', phoneCode: '+992' },
  { name: 'Tanzania', phoneCode: '+255' },
  { name: 'Thailand', phoneCode: '+66' },
  { name: 'Timor-Leste', phoneCode: '+670' },
  { name: 'Togo', phoneCode: '+228' },
  { name: 'Tonga', phoneCode: '+676' },
  { name: 'Trinidad and Tobago', phoneCode: '+1-868' },
  { name: 'Tunisia', phoneCode: '+216' },
  { name: 'Turkey', phoneCode: '+90' },
  { name: 'Turkmenistan', phoneCode: '+993' },
  { name: 'Tuvalu', phoneCode: '+688' },
  { name: 'Uganda', phoneCode: '+256' },
  { name: 'Ukraine', phoneCode: '+380' },
  { name: 'United Arab Emirates', phoneCode: '+971' },
  { name: 'United Kingdom', phoneCode: '+44' },
  { name: 'United States', phoneCode: '+1' },
  { name: 'Uruguay', phoneCode: '+598' },
  { name: 'Uzbekistan', phoneCode: '+998' },
  { name: 'Vanuatu', phoneCode: '+678' },
  { name: 'Venezuela', phoneCode: '+58' },
  { name: 'Vietnam', phoneCode: '+84' },
  { name: 'Yemen', phoneCode: '+967' },
  { name: 'Zambia', phoneCode: '+260' },
  { name: 'Zimbabwe', phoneCode: '+263' },
];

// Sample ContactForm component
const ContactForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const watchCountry = watch('country');
  const selectedCountry = COUNTRIES.find((c) => c.name === watchCountry);
  const countryCode = selectedCountry ? selectedCountry.phoneCode : '';

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: data.name,
        email: data.email,
        phone: `${countryCode}${data.phone}`,
        country: data.country,
        country_code: countryCode,
        subject: data.subject,
        message: data.message,
        status: 'new',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Us a Message</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              id="name"
              {...register('name')}
              className="mt-1"
              placeholder="Your full name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1"
              placeholder="Your email address"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              id="country"
              {...register('country')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-gold focus:border-primary-gold sm:text-sm"
              defaultValue=""
            >
             

 <option value="" disabled>
                Select your country
              </option>
              {COUNTRIES.map((country) => (
                <option key={country.name} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="flex mt-1">
              <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                {countryCode || '+1'}
              </span>
              <Input
                id="phone"
                {...register('phone')}
                className="flex-1 rounded-l-none"
                placeholder="Your phone number"
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <Input
              id="subject"
              {...register('subject')}
              className="mt-1"
              placeholder="Subject of your message"
            />
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              {...register('message')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-gold focus:border-primary-gold sm:text-sm"
              rows={5}
              placeholder="Your message"
            />
            {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-gold text-[#181818] hover:bg-opacity-90"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

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
        <div style={{ backgroundColor: '#181818' }} className="text-white py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Contact Us</h1>
            <p className="text-base sm:text-xl text-gray-200 max-w-2xl mx-auto">
              Ready to find your dream property? Get in touch with our expert team across Africa.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Form */}
            <div>
              <ContactForm />
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
                        <h3 className="font-semibold mb-2" style={{ color: '#181818' }}>
                          {info.title}
                        </h3>
                        <div className="space-y-1">
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-sm text-gray-600">
                              {detail}
                            </p>
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
                      <div
                        key={index}
                        className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <MapPin className="w-4 h-4 text-primary-gold" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold" style={{ color: '#181818' }}>
                              {office.city}, {office.country}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">{office.address}</p>
                            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0 text-sm">
                              <a
                                href={`tel:${office.phone}`}
                                className="hover:text-primary-gold flex items-center"
                                style={{ color: '#181818' }}
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                {office.phone}
                              </a>
                              <a
                                href={`mailto:${office.email}`}
                                className="hover:text-primary-gold flex items-center"
                                style={{ color: '#181818' }}
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