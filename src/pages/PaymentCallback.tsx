import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { pesapalService } from '@/lib/payment';
import { formatPrice } from '@/lib/countries';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderTrackingId = searchParams.get('OrderTrackingId');
        const orderMerchantReference = searchParams.get('OrderMerchantReference');

        if (!orderTrackingId) {
          setStatus('failed');
          return;
        }

        // Get pending booking data from localStorage
        const pendingBooking = localStorage.getItem('pendingBooking');
        if (pendingBooking) {
          setBookingData(JSON.parse(pendingBooking));
        }

        // Verify payment with PesaPal
        const verification = await pesapalService.verifyPayment(orderTrackingId);
        
        if (verification.payment_status === 'COMPLETED') {
          setStatus('success');
          setPaymentDetails({
            orderTrackingId,
            orderMerchantReference,
            ...verification
          });
          
          // Clear pending booking data
          localStorage.removeItem('pendingBooking');
          
          // In a real app, save the booking to database here
          console.log('Booking confirmed:', {
            ...bookingData,
            payment_reference: orderTrackingId,
            status: 'paid'
          });
        } else if (verification.payment_status === 'PENDING') {
          setStatus('pending');
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      default:
        return <LoadingSpinner size="lg" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return {
          title: 'Payment Successful!',
          message: 'Your visit booking has been confirmed. We will contact you shortly with further details.',
          color: 'text-green-600'
        };
      case 'failed':
        return {
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please try again or contact support.',
          color: 'text-red-600'
        };
      case 'pending':
        return {
          title: 'Payment Pending',
          message: 'Your payment is being processed. We will notify you once it is confirmed.',
          color: 'text-yellow-600'
        };
      default:
        return {
          title: 'Verifying Payment...',
          message: 'Please wait while we verify your payment.',
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className={`text-2xl font-bold ${statusInfo.color}`}>
              {statusInfo.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600">{statusInfo.message}</p>

            {bookingData && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="font-medium">{bookingData.client_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{bookingData.client_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">{bookingData.visit_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{bookingData.visit_time}</span>
                  </div>
                  {bookingData.payment_amount && (
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-semibold">Amount Paid:</span>
                      <span className="font-semibold text-primary-gold">
                        {formatPrice(bookingData.payment_amount, bookingData.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {paymentDetails && status === 'success' && (
              <div className="bg-green-50 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-green-900 mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-medium">{paymentDetails.orderTrackingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reference:</span>
                    <span className="font-medium">{paymentDetails.orderMerchantReference}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {status === 'success' && (
                <Button className="w-full btn-primary" asChild>
                  <Link to="/properties">Browse More Properties</Link>
                </Button>
              )}
              
              {status === 'failed' && (
                <Button className="w-full btn-primary" asChild>
                  <Link to="/properties">Try Again</Link>
                </Button>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {status === 'success' && (
              <div className="text-xs text-gray-500">
                A confirmation email has been sent to {bookingData?.client_email}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentCallback;