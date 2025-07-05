import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, CreditCard, MapPin, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { z } from 'zod';
import { pesapalService, getVisitBookingFee, formatPaymentAmount, validatePaymentAmount } from '@/lib/payment';
import { usePropertyVisits } from '@/hooks/usePropertyVisits';
import type { Property } from '@/types';

// Visit booking validation schema
const visitBookingSchema = z.object({
  property_id: z.string().min(1, 'Property is required'),
  visitor_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  preferred_date: z.string().min(1, 'Visit date is required'),
  preferred_time: z.string().min(1, 'Visit time is required'),
  notes: z.string().optional(),
});

type VisitBookingFormData = z.infer<typeof visitBookingSchema>;

interface ScheduleVisitModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [visitData, setVisitData] = useState<VisitBookingFormData | null>(null);
  const [visitId, setVisitId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | null>(null);

  const { createVisitRequest } = usePropertyVisits();
  const visitFee = getVisitBookingFee(property.country);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<VisitBookingFormData>({
    resolver: zodResolver(visitBookingSchema),
    defaultValues: {
      property_id: property.id,
    },
  });

  const watchedDate = watch('preferred_date');
  const watchedTime = watch('preferred_time');

  // Test connection when payment modal opens
  const testPaymentConnection = async () => {
    setConnectionStatus('checking');
    try {
      const result = await pesapalService.testConnection();
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
      if (!result.success) {
        setPaymentError(result.message);
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setPaymentError('Unable to connect to payment service');
    }
  };

  const onSubmit = async (data: VisitBookingFormData) => {
    setIsSubmitting(true);
    setPaymentError(null);

    try {
      // Validate the selected date/time
      const selectedDate = new Date(`${data.preferred_date}T${data.preferred_time}`);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);

      if (selectedDate < tomorrow) {
        toast.error('Please select a date and time at least 24 hours from now');
        setIsSubmitting(false);
        return;
      }

      // Check if it's within business hours (8 AM - 6 PM)
      const hour = selectedDate.getHours();
      if (hour < 8 || hour >= 18) {
        toast.error('Please select a time between 8:00 AM and 6:00 PM');
        setIsSubmitting(false);
        return;
      }

      // Check if it's not Sunday
      if (selectedDate.getDay() === 0) {
        toast.error('We are closed on Sundays. Please select another day.');
        setIsSubmitting(false);
        return;
      }

      const visit = await createVisitRequest({
        property_id: data.property_id,
        visitor_name: data.visitor_name,
        email: data.email,
        phone: data.phone,
        preferred_date: data.preferred_date,
        preferred_time: data.preferred_time,
        notes: data.notes,
      });

      setVisitData(data);
      setVisitId(visit.id);
      setShowPayment(true);
      
      // Test payment connection when showing payment
      await testPaymentConnection();
      
      toast.success('Visit booking created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save visit booking. Please try again.');
      console.error('Visit booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!visitData || !visitId) return;

    setIsSubmitting(true);
    setPaymentError(null);

    try {
      // Validate payment amount
      if (!validatePaymentAmount(visitFee.amount, visitFee.currency)) {
        throw new Error('Invalid payment amount for selected currency');
      }

      const paymentData = {
        amount: visitFee.amount,
        currency: visitFee.currency,
        description: `Visit booking for ${property.title} - ${property.location}, ${property.city}`,
        reference: visitId,
        email: visitData.email,
        phone: visitData.phone,
      };

      console.log('Initiating payment with data:', paymentData);

      const response = await pesapalService.initiatePayment(paymentData);

      console.log('Payment response:', response);

      if (response.status === 'success' && response.payment_url) {
        // Store visit data in localStorage for callback processing
        localStorage.setItem('pendingVisit', JSON.stringify({
          visitId,
          propertyTitle: property.title,
          amount: visitFee.amount,
          currency: visitFee.currency,
          visitorName: visitData.visitor_name,
          visitorEmail: visitData.email,
          preferredDate: visitData.preferred_date,
          preferredTime: visitData.preferred_time,
        }));

        toast.success('Redirecting to payment...');
        
        // Redirect to payment page
        window.location.href = response.payment_url;
      } else {
        throw new Error(response.message || 'Payment initiation failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
      toast.error(errorMessage);
      console.error('Payment error:', error);
      setConnectionStatus('disconnected');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryConnection = async () => {
    await testPaymentConnection();
  };

  const handleClose = () => {
    reset();
    setShowPayment(false);
    setVisitData(null);
    setVisitId(null);
    setPaymentError(null);
    setConnectionStatus(null);
    onClose();
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get maximum date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-gold mt-1" />
                <div>
                  <h3 className="font-semibold text-primary-navy mb-1">{property.title}</h3>
                  <p className="text-sm text-gray-600">{property.location}, {property.city}, {property.country}</p>
                  <p className="text-sm text-primary-gold font-medium mt-2">
                    Visit Fee: {formatPaymentAmount(visitFee.amount, visitFee.currency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Your Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  {...register('visitor_name')}
                  placeholder="Enter your full name"
                  className={errors.visitor_name ? 'border-red-500' : ''}
                />
                {errors.visitor_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.visitor_name.message}</p>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  {...register('phone')}
                  placeholder="Enter your phone number (e.g., +254700123456)"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date *
                  </label>
                  <Input
                    type="date"
                    {...register('preferred_date')}
                    min={minDate}
                    max={maxDateStr}
                    className={errors.preferred_date ? 'border-red-500' : ''}
                  />
                  {errors.preferred_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.preferred_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time *
                  </label>
                  <Input
                    type="time"
                    {...register('preferred_time')}
                    min="08:00"
                    max="18:00"
                    className={errors.preferred_time ? 'border-red-500' : ''}
                  />
                  {errors.preferred_time && (
                    <p className="text-red-500 text-sm mt-1">{errors.preferred_time.message}</p>
                  )}
                </div>
              </div>

              {watchedDate && watchedTime && (
                <div className="text-xs text-blue-600 mt-1">
                  Selected: {new Date(`${watchedDate}T${watchedTime}`).toLocaleString()}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Message (Optional)
                </label>
                <Textarea
                  {...register('notes')}
                  placeholder="Any specific requirements or questions about the property?"
                  rows={3}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A visit fee of {formatPaymentAmount(visitFee.amount, visitFee.currency)} is required to confirm your booking. 
                This fee will be deducted from the property price if you decide to purchase.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 btn-primary"
              >
                {isSubmitting ? 'Saving...' : 'Continue to Payment'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            {connectionStatus && (
              <div className={`p-3 rounded-lg flex items-center ${
                connectionStatus === 'connected' ? 'bg-green-50' : 
                connectionStatus === 'disconnected' ? 'bg-red-50' : 'bg-yellow-50'
              }`}>
                {connectionStatus === 'checking' && (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                    <span className="text-sm text-yellow-800">Checking payment service connection...</span>
                  </>
                )}
                {connectionStatus === 'connected' && (
                  <>
                    <Wifi className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">Connected to payment service</span>
                  </>
                )}
                {connectionStatus === 'disconnected' && (
                  <>
                    <WifiOff className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-800">Payment service unavailable</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetryConnection}
                      className="ml-auto"
                    >
                      Retry
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Visit Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-primary-navy mb-3">Visit Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Property:</span>
                  <span className="font-medium">{property.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visitor:</span>
                  <span className="font-medium">{visitData?.visitor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span className="font-medium">
                    {visitData?.preferred_date && visitData?.preferred_time && 
                      new Date(`${visitData.preferred_date}T${visitData.preferred_time}`).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-semibold">Visit Fee:</span>
                  <span className="font-semibold text-primary-gold">
                    {formatPaymentAmount(visitFee.amount, visitFee.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Error */}
            {paymentError && (
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900">Payment Error</h4>
                    <p className="text-sm text-red-800 mt-1">{paymentError}</p>
                    {paymentError.includes('connect') && (
                      <p className="text-xs text-red-700 mt-2">
                        This may be due to network connectivity issues. Please check your internet connection and try again.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-primary-gold mx-auto mb-3" />
              <p className="text-gray-600 mb-4">
                You will be redirected to PesaPal to complete your payment securely using:
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Mobile Money (M-Pesa, Airtel Money, etc.)</p>
                <p>• Credit/Debit Cards</p>
                <p>• Bank Transfer</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPayment(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={isSubmitting || connectionStatus === 'disconnected'}
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

export default ScheduleVisitModal;