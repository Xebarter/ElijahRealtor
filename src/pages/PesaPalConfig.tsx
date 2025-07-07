import PesaPalConfigChecker from '@/components/common/PesaPalConfigChecker';

const PesaPalConfig = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PesaPal Configuration
          </h1>
          <p className="text-gray-600">
            Check and configure your PesaPal payment integration settings
          </p>
        </div>
        
        <PesaPalConfigChecker />
      </div>
    </div>
  );
};

export default PesaPalConfig; 