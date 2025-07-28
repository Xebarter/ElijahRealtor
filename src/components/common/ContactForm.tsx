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
    <Card className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Send Us a Message</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Your email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <div className="flex">
                    <span className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-background px-3 text-sm text-muted-foreground">
                      {countryCode || '+'}
                    </span>
                    <FormControl>
                      <Input className="rounded-l-none" placeholder="Your phone number" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Subject of your message" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Your message" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-gold text-white hover:bg-primary-gold/90 transition-colors duration-300"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;