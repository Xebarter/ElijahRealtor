import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '../../lib/supabase';
import { sendContactNotification } from '@/services/notificationService';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { COUNTRIES } from '../../lib/allCountries';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is too short').max(20, 'Phone number is too long'),
  country: z.string({ required_error: 'Please select a country.' }).min(1, 'Please select a country'),
  subject: z.string().min(2, 'Subject must be at least 2 characters').max(100, 'Subject must not exceed 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must not exceed 1000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactForm = () => {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      country: '',
      subject: '',
      message: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const watchCountry = form.watch('country');
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
        created_at: new Date().toISOString(),
        status: 'new'
      });

      if (!error) {
        // Send notification when message is successfully submitted
        await sendContactNotification({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message
        });
      }

      if (error) throw error;
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      form.reset();
    } catch (error) {
      toast.error('Error sending message. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-2 sm:mx-auto bg-white dark:bg-gray-800 shadow-sm sm:shadow-lg rounded-none sm:rounded-lg overflow-hidden border-0 sm:border">
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <CardTitle className="text-lg sm:text-2xl font-semibold text-gray-800 dark:text-white">Send Us a Message</CardTitle>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">We'll get back to you as soon as possible</p>
      </CardHeader>
      <CardContent className="p-3 sm:p-5 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Full Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your full name" 
                        className="text-sm h-10 sm:h-11 w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-primary-gold/50"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] sm:text-xs text-red-500 dark:text-red-400" />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Email Address <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="your.email@example.com" 
                        className="text-sm h-10 sm:h-11 w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-primary-gold/50"
                        inputMode="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] sm:text-xs text-red-500 dark:text-red-400" />
                  </FormItem>
                )}
              />

              {/* Country */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Country <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 sm:h-11 text-sm w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-gold/50">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.name} value={country.name} className="text-sm">
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number <span className="text-red-500">*</span></FormLabel>
                    <div className="flex">
                      <span className="flex h-10 sm:h-11 items-center rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {countryCode || '+'}
                      </span>
                      <FormControl>
                        <Input 
                          className="rounded-l-none text-sm h-10 sm:h-11 w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-primary-gold/50" 
                          placeholder="e.g., 712345678" 
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-[11px] sm:text-xs text-red-500 dark:text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Subject - Full Width */}
            <div className="space-y-1.5">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Subject <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="How can we help you?" 
                        className="text-sm h-10 sm:h-11 w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-primary-gold/50"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] sm:text-xs text-red-500 dark:text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Message - Full Width */}
            <div className="space-y-1.5">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Message <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide details about your inquiry..." 
                        className="resize-none min-h-[120px] sm:min-h-[140px] text-sm w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-primary-gold/50" 
                        rows={5}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] sm:text-xs text-red-500 dark:text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 pt-3 pb-2 -mx-3 sm:-mx-5 md:-mx-6 px-3 sm:px-5 md:px-6 border-t border-gray-100 dark:border-gray-700">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 sm:h-12 text-sm font-medium bg-primary-gold hover:bg-primary-gold/90 text-white shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;