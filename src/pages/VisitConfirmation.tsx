import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Home, Calendar, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { pesapalService, formatPaymentAmount } from '@/lib/payment';
import { useVisits } from '@/hooks/useVisits';
import toast from 'react-hot-toast';

const VisitConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [visitData, setVisitData] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  const { updateVisitPayment } = useVisits();

  useEffect(() => {
    const verifyPaymentAndUpdateVisit = async () => {
      try {
        const orderTrackingId = searchParams.get('OrderTrackingId');
        const orderMerchantReference = searchParams.get('OrderMerchantReference');

        if (!orderTrackingId) {
          setStatus('failed');
          toast.error('Invalid payment reference');
          return;
        }

        // Get pending visit data from localStorage
        const pendingVisit = localStorage.getItem('pendingVisit');
        if (pendingVisit) {
          const parsedVisitData = JSON.parse(pendingVisit);
          setVisitData(parsedVisitData);
        }

        // Verify payment with PesaPal
        const verification = await pesapalService.verifyPayment(orderTrackingId);
        
        console.log('Payment verification result:', verification);

        if (verification.payment_status === 'COMPLETED' || verification.status === 'COMPLETED') {
          // Update visit status in database
          const visitId = JSON.parse(pendingVisit || '{}').visitId;
          if (visitId) {
            await updateVisitPayment(visitId, orderTrackingId);
            toast.success('Payment confirmed and visit scheduled!');
          }

          setStatus('success');
          setPaymentDetails({
            orderTrackingId,
            orderMerchantReference,
            ...verification
          });
          
          // Clear pending visit data
          localStorage.removeItem('pendingVisit');
        } else if (verification.payment_status === 'PENDING' || verification.status === 'PENDING') {
          setStatus('pending');
          
          // Retry verification after a delay for pending payments
          if (retryCount < maxRetries) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              verifyPaymentAndUpdateVisit();
            }, 5000); // Retry after 5 seconds
          }
        } else if (verification.payment_status === 'FAILED' || verification.status === 'FAILED') {
          setStatus('failed');
          toast.error('Payment failed. Please try again.');
        } else {
          // For other statuses, treat as pending initially
          setStatus('pending');
          
          if (retryCount < maxRetries) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              verifyPaymentAndUpdateVisit();
            }, 3000);
          } else {
            setStatus('failed');
            toast.error('Payment verification timeout. Please contact support.');
          }
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            verifyPaymentAndUpdateVisit();
          }, 3000);
        } else {
          setStatus('failed');
          toast.error('Payment verification failed. Please contact support if payment was deducted.');
        }
      }
    };

    verifyPaymentAndUpdateVisit();
  }, [searchParams, updateVisitPayment, retryCount]);

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
          title: 'Visit Confirmed!',
          message: 'Your property visit has been successfully scheduled and paid for. We will contact you shortly to confirm the details.',
          color: 'text-green-600'
        };
      case 'failed':
        return {
          title: 'Payment Failed',
          message: 'Your payment could not be processed or was declined. Please try booking again or contact our support team.',
          color: 'text-red-600'
        };
      case 'pending':
        return {
          title: 'Payment Processing',
          message: `Your payment is being processed. Please wait while we verify the transaction${retryCount > 0 ? ` (Attempt ${retryCount + 1}/${maxRetries + 1})` : ''}...`,
          color: 'text-yellow-600'
        };
      default:
        return {
          title: 'Verifying Payment...',
          message: 'Please wait while we verify your payment and confirm your visit.',
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

            {visitData && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary-gold" />
                  Visit Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Property:</span>
                    <span className="font-medium">{visitData.propertyTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Visit ID:</span>
                    <span className="font-medium text-xs">{visitData.visitId}</span>
                  </div>
                  {visitData.amount && (
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-semibold">Amount:</span>
                      <span className="font-semibold text-primary-gold">
                        {formatPaymentAmount(visitData.amount, visitData.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {paymentDetails && status === 'success' && (
              <div className="bg-green-50 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Confirmed
                </h3>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-medium text-xs">{paymentDetails.orderTrackingId}</span>
                  </div>
                  {paymentDetails.orderMerchantReference && (
                    <div className="flex justify-between">
                      <span>Reference:</span>
                      <span className="font-medium text-xs">{paymentDetails.orderMerchantReference}</span>
                    </div>
                  )}
                  {paymentDetails.payment_method && (
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-medium">{paymentDetails.payment_method}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>• Our team will contact you within 24 hours</li>
                  <li>• We'll confirm the visit date and time</li>
                  <li>• You'll receive detailed directions to the property</li>
                  <li>• The visit fee will be deducted if you purchase the property</li>
                </ul>
              </div>
            )}

            {status === 'pending' && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Please Wait</h3>
                <p className="text-sm text-yellow-800">
                  Payment processing can take a few minutes. Please don't close this page or refresh your browser.
                </p>
              </div>
            )}

            {status === 'failed' && (
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Need Help?</h3>
                <p className="text-sm text-red-800">
                  If you believe this is an error or if money was deducted from your account, 
                  please contact our support team with your transaction details.
                </p>
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

              {(status === 'success' || status === 'failed') && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/contact">
                    <MapPin className="w-4 h-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
              )}
            </div>

            {status === 'success' && visitData && (
              <div className="text-xs text-gray-500">
                A confirmation email will be sent to you shortly with all the visit details.
              </div>
            )}

            {status === 'pending' && (
              <div className="text-xs text-gray-500">
                This page will automatically update when payment is confirmed.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisitConfirmation;