import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, X, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { visitBookingSchema } from '@/lib/validations';
import { pesapalService, getVisitBookingFee } from '@/lib/payment';
import { formatPrice } from '@/lib/countries';
import type { Property, VisitBookingForm } from '@/types';
import type { z } from 'zod';

interface VisitBookingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

type VisitBookingFormData = z.infer<typeof visitBookingSchema>;

const VisitBookingModal: React.FC<VisitBookingModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingData, setBookingData] = useState<VisitBookingFormData | null>(null);

  const visitFee = getVisitBookingFee(property.country);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VisitBookingFormData>({
    resolver: zodResolver(visitBookingSchema),
    defaultValues: {
      property_id: property.id,
    },
  });

  const onSubmit = async (data: VisitBookingFormData) => {
    setBookingData(data);
    setShowPayment(true);
  };

  const handlePayment = async () => {
    if (!bookingData) return;

    setIsSubmitting(true);
    try {
      const paymentData = {
        amount: visitFee.amount,
        currency: visitFee.currency,
        description: `Visit booking for ${property.title}`,
        reference: `VISIT_${Date.now()}`,
        email: bookingData.client_email,
        phone: bookingData.client_phone,
      };

      const response = await pesapalService.initiatePayment(paymentData);

      if (response.status === 'success' && response.payment_url) {
        // Store booking data in localStorage for callback processing
        localStorage.setItem('pendingBooking', JSON.stringify({
          ...bookingData,
          payment_reference: response.order_tracking_id,
          payment_amount: visitFee.amount,
          currency: visitFee.currency,
        }));

        // Redirect to payment page
        window.location.href = response.payment_url;
      } else {
        throw new Error(response.message || 'Payment initiation failed');
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setShowPayment(false);
    setBookingData(null);
    onClose();
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary-gold" />
            {showPayment ? 'Complete Payment' : 'Schedule Property Visit'}
          </DialogTitle>
        </DialogHeader>

        {!showPayment ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Property Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-primary-navy mb-1">{property.title}</h3>
              <p className="text-sm text-gray-600">{property.location}, {property.city}</p>
              <p className="text-sm text-primary-gold font-medium mt-2">
                Visit Fee: {formatPrice(visitFee.amount, visitFee.currency)}
              </p>
            </div>

            {/* Client Information */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  {...register('client_name')}
                  placeholder="Enter your full name"
                  className={errors.client_name ? 'border-red-500' : ''}
                />
                {errors.client_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.client_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  {...register('client_email')}
                  placeholder="Enter your email"
                  className={errors.client_email ? 'border-red-500' : ''}
                />
                {errors.client_email && (
                  <p className="text-red-500 text-sm mt-1">{errors.client_email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  {...register('client_phone')}
                  placeholder="Enter your phone number"
                  className={errors.client_phone ? 'border-red-500' : ''}
                />
                {errors.client_phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.client_phone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Date *
                  </label>
                  <Input
                    type="date"
                    {...register('visit_date')}
                    min={minDate}
                    className={errors.visit_date ? 'border-red-500' : ''}
                  />
                  {errors.visit_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.visit_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Time *
                  </label>
                  <Input
                    type="time"
                    {...register('visit_time')}
                    min="08:00"
                    max="18:00"
                    className={errors.visit_time ? 'border-red-500' : ''}
                  />
                  {errors.visit_time && (
                    <p className="text-red-500 text-sm mt-1">{errors.visit_time.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <Textarea
                  {...register('notes')}
                  placeholder="Any specific requirements or questions?"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 btn-primary">
                Continue to Payment
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-primary-navy mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Property:</span>
                  <span className="font-medium">{property.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{bookingData?.visit_date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{bookingData?.visit_time}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-semibold">Visit Fee:</span>
                  <span className="font-semibold text-primary-gold">
                    {formatPrice(visitFee.amount, visitFee.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-primary-gold mx-auto mb-3" />
              <p className="text-gray-600 mb-4">
                You will be redirected to PesaPal to complete your payment securely.
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPayment(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={isSubmitting}
                className="flex-1 btn-primary"
              >
                {isSubmitting ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VisitBookingModal;