import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { checkPesaPalConfiguration, pesapalService } from '@/lib/payment';

const PesaPalConfigChecker = () => {
  const [configStatus, setConfigStatus] = useState<{ configured: boolean; missing: string[] } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const status = checkPesaPalConfiguration();
    setConfigStatus(status);
  }, []);

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const result = await pesapalService.testConnection();
      setConnectionStatus(result);
    } catch (error: any) {
      setConnectionStatus({ success: false, message: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  if (!configStatus) {
    return <div>Loading configuration status...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          PesaPal Configuration Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {configStatus.configured ? (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All required PesaPal environment variables are configured.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Missing required environment variables: {configStatus.missing.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {configStatus.configured && (
          <div className="space-y-3">
            <Button 
              onClick={testConnection} 
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? 'Testing Connection...' : 'Test PesaPal Connection'}
            </Button>

            {connectionStatus && (
              <Alert variant={connectionStatus.success ? "default" : "destructive"}>
                {connectionStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {connectionStatus.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Setup Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Create a <code className="bg-gray-200 px-1 rounded">.env</code> file in your project root</li>
            <li>Add the following variables to your <code className="bg-gray-200 px-1 rounded">.env</code> file:</li>
          </ol>
          
          <div className="mt-3 bg-gray-100 p-3 rounded font-mono text-xs">
            <div>VITE_PESAPAL_CONSUMER_KEY=your_consumer_key_here</div>
            <div>VITE_PESAPAL_CONSUMER_SECRET=your_consumer_secret_here</div>
            <div>VITE_PESAPAL_IPN_ID=your_ipn_id_here</div>
            <div>VITE_PESAPAL_CALLBACK_URL=http://localhost:5173/visit-confirmation</div>
            <div>VITE_PESAPAL_ENVIRONMENT=sandbox</div>
          </div>

          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://developer.pesapal.com/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get PesaPal Credentials
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PesaPalConfigChecker; 