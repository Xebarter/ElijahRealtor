import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { mockPesaPalService } from '@/lib/mockPesaPal';

const MockPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'processing' | 'success' | 'failed'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const processPayment = async () => {
      const orderTrackingId = searchParams.get('orderTrackingId');
      
      if (!orderTrackingId) {
        setStatus('failed');
        return;
      }

      // Simulate payment processing
      setStatus('processing');
      
      // Wait for 3 seconds to simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate payment verification
      try {
        const verification = await mockPesaPalService.verifyPayment(orderTrackingId);
        
        if (verification.payment_status === 'COMPLETED') {
          setStatus('success');
          setPaymentDetails({
            orderTrackingId,
            ...verification
          });
        } else {
          setStatus('failed');
        }
      } catch (error) {
        setStatus('failed');
      }
    };

    processPayment();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'processing':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      default:
        return <LoadingSpinner size="lg" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Payment completed successfully!';
      case 'failed':
        return 'Payment failed. Please try again.';
      case 'processing':
        return 'Processing your payment...';
      default:
        return 'Initializing payment...';
    }
  };

  const handleContinue = () => {
    // Redirect to visit confirmation page
    navigate('/visit-confirmation', { 
      state: { 
        orderTrackingId: searchParams.get('orderTrackingId'),
        mockPayment: true 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl">
            {status === 'processing' ? 'Processing Payment' : 'Payment Status'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{getStatusMessage()}</p>
            
            {status === 'processing' && (
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-sm text-gray-500">Please wait while we process your payment...</p>
              </div>
            )}
          </div>

          {paymentDetails && (
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div><strong>Order ID:</strong> {paymentDetails.orderTrackingId}</div>
                  <div><strong>Amount:</strong> {paymentDetails.currency} {paymentDetails.amount}</div>
                  <div><strong>Method:</strong> {paymentDetails.payment_method}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            {status === 'success' && (
              <Button 
                onClick={handleContinue}
                className="flex-1"
              >
                Continue
              </Button>
            )}
          </div>

          {status === 'failed' && (
            <Alert variant="destructive">
              <AlertDescription>
                This is a mock payment system for development. In production, this would redirect to the actual PesaPal payment gateway.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MockPayment; 