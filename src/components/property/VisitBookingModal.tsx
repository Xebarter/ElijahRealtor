import { useState } from 'react';
import { X, Calendar, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { visitBookingSchema } from '@/lib/validations';
import { pesapalService, getVisitBookingFee } from '@/lib/payment';
import { formatPrice } from '@/lib/countries';
import type { Property } from '@/types';
import type { z } from 'zod';
import toast from 'react-hot-toast';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingData, setBookingData] = useState<VisitBookingFormData | null>(null);

  const visitFee = getVisitBookingFee(property.country);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VisitBookingFormData>({
    resolver: zodResolver(visitBookingSchema),
    defaultValues: {
      property_id: property.id,
    },
  });

  const onSubmit = async (data: VisitBookingFormData) => {
    setBookingData(data);
    setShowSuccessModal(true);
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
        email: bookingData.email,
        phone: bookingData.phone,
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
    setValue('name', '');
    setValue('email', '');
    setValue('phone', '');
    setValue('preferred_time', '');
    setValue('message', '');
    setShowSuccessModal(false);
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
            {showSuccessModal ? 'Complete Payment' : 'Schedule Property Visit'}
          </DialogTitle>
        </DialogHeader>

        {!showSuccessModal ? (
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
                  {...register('name')}
                  placeholder="Your full name"
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
                  placeholder="Your email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  {...register('phone')}
                  placeholder="Your phone number"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date & Time *
                </label>
                <Input
                  {...register('preferred_time')}
                  type="datetime-local"
                  className={errors.preferred_time ? 'border-red-500' : ''}
                />
                {errors.preferred_time && (
                  <p className="text-red-500 text-sm mt-1">
                    {typeof errors.preferred_time.message === 'string' ? errors.preferred_time.message : 'Preferred time is required'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <Textarea
                  {...register('message')}
                  placeholder="Any additional notes or special requests..."
                  rows={3}
                  className={errors.message ? 'border-red-500' : ''}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
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
                  <span>Preferred Time:</span>
                  <span className="font-medium">
                    {bookingData?.preferred_time ? new Date(bookingData.preferred_time).toLocaleString() : ''}
                  </span>
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
              <p className="text-gray-600 mb-4">
                You will be redirected to PesaPal to complete your payment securely.
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowSuccessModal(false)}
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

            <div className="space-y-3">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">Name:</span>
                <span className="ml-2">{bookingData?.name}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span className="ml-2">{bookingData?.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">Phone:</span>
                <span className="ml-2">{bookingData?.phone}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">Preferred Time:</span>
                <span className="ml-2">{bookingData?.preferred_time}</span>
              </div>
              {bookingData?.message && (
                <div className="flex items-start">
                  <MessageSquare className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                  <span className="font-medium">Message:</span>
                  <span className="ml-2">{bookingData.message}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VisitBookingModal;