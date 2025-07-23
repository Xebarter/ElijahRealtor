import { useState } from 'react';
import { DollarSign, Upload, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { financingSchema } from '@/lib/validations';
import type { z } from 'zod';
import toast from 'react-hot-toast';
import { COUNTRIES } from '@/lib/countries';
import type { Property } from '@/types';
import { supabase } from '@/lib/supabase';

interface FinancingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

type FinancingFormData = z.infer<typeof financingSchema>;

const FinancingModal: React.FC<FinancingModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [incomeProof, setIncomeProof] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FinancingFormData>({
    resolver: zodResolver(financingSchema),
    defaultValues: {
      property_id: property.id,
      currency: 'USD',
      employment_status: 'employed',
    },
  });

  const watchCurrency = watch('currency');

  const onSubmit = async (data: any) => {
    if (!idDocument || !incomeProof) {
      toast.error('Please upload all required documents');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload ID Document
      const idDocExt = idDocument.name.split('.').pop();
      const idDocPath = `financing/${property.id}/${Date.now()}-id.${idDocExt}`;
      const { data: idDocUpload, error: idDocError } = await supabase.storage.from('financing-documents').upload(idDocPath, idDocument);
      if (idDocError) {
        console.error('ID Document upload error:', idDocError);
        throw idDocError;
      }
      const { data: idDocUrlData } = supabase.storage.from('financing-documents').getPublicUrl(idDocPath);
      const idDocUrl = idDocUrlData.publicUrl;

      // Upload Income Proof
      const incomeProofExt = incomeProof.name.split('.').pop();
      const incomeProofPath = `financing/${property.id}/${Date.now()}-income.${incomeProofExt}`;
      const { data: incomeProofUpload, error: incomeProofError } = await supabase.storage.from('financing-documents').upload(incomeProofPath, incomeProof);
      if (incomeProofError) {
        console.error('Income Proof upload error:', incomeProofError);
        throw incomeProofError;
      }
      const { data: incomeProofUrlData } = supabase.storage.from('financing-documents').getPublicUrl(incomeProofPath);
      const incomeProofUrl = incomeProofUrlData.publicUrl;

      // Insert application into DB
      const { error: insertError } = await supabase.from('financing_applications').insert({
        property_id: property.id,
        applicant_name: data.applicant_name,
        applicant_email: data.applicant_email,
        applicant_phone: data.applicant_phone,
        monthly_income: data.monthly_income,
        currency: data.currency,
        employment_status: data.employment_status,
        id_document_url: idDocUrl,
        income_proof_url: incomeProofUrl,
        status: 'received',
      });
      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      toast.success('Financing application submitted successfully!');
      handleClose();
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
      console.error('Financing application error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setIdDocument(null);
    setIncomeProof(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-primary-gold" />
            Apply for Financing
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Property Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-primary-navy mb-1">{property.title}</h3>
            <p className="text-sm text-gray-600">{property.location}, {property.city}</p>
            <p className="text-sm text-primary-gold font-medium mt-1">
              Price: {property.currency} {property.price.toLocaleString()}
            </p>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Personal Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <Input
                {...register('applicant_name')}
                placeholder="Enter your full name"
                className={errors.applicant_name ? 'border-red-500' : ''}
              />
              {errors.applicant_name && (
                <p className="text-red-500 text-sm mt-1">
                  {typeof errors.applicant_name.message === 'string' ? errors.applicant_name.message : 'Full name is required'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <Input
                {...register('applicant_email')}
                type="email"
                placeholder="Enter your email address"
                className={errors.applicant_email ? 'border-red-500' : ''}
              />
              {errors.applicant_email && (
                <p className="text-red-500 text-sm mt-1">
                  {typeof errors.applicant_email.message === 'string' ? errors.applicant_email.message : 'Valid email is required'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <Input
                {...register('applicant_phone')}
                placeholder="Enter your phone number"
                className={errors.applicant_phone ? 'border-red-500' : ''}
              />
              {errors.applicant_phone && (
                <p className="text-red-500 text-sm mt-1">
                  {typeof errors.applicant_phone.message === 'string' ? errors.applicant_phone.message : 'Phone number is required'}
                </p>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Financial Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income *
                </label>
                <Input
                  type="number"
                  {...register('monthly_income', { valueAsNumber: true })}
                  placeholder="Enter monthly income"
                  className={errors.monthly_income ? 'border-red-500' : ''}
                />
                {errors.monthly_income && (
                  <p className="text-red-500 text-sm mt-1">{errors.monthly_income.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <Select
                  value={watchCurrency}
                  onValueChange={(value) => setValue('currency', value)}
                >
                  <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.currency} value={country.currency}>
                        {country.currency} - {country.currencySymbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-red-500 text-sm mt-1">{errors.currency.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Status *
              </label>
              <Select onValueChange={(value) => setValue('employment_status', value)}>
                <SelectTrigger className={errors.employment_status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="self-employed">Self Employed</SelectItem>
                  <SelectItem value="business-owner">Business Owner</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.employment_status && (
                <p className="text-red-500 text-sm mt-1">{errors.employment_status.message}</p>
              )}
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Required Documents</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Document *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload your ID document (Passport, Driver's License, etc.)
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                  className="block mx-auto mb-2 border border-gray-300 rounded px-3 py-2 cursor-pointer text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  id="id-document"
                />
                {idDocument && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {idDocument.name}
                  </p>
                )}
              </div>
              {errors.id_document && (
                <p className="text-red-500 text-sm mt-1">
                  {typeof errors.id_document.message === 'string' ? errors.id_document.message : 'ID document is required'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Income Proof *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload proof of income (Payslip, Bank Statement, etc.)
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setIncomeProof(e.target.files?.[0] || null)}
                  className="block mx-auto mb-2 border border-gray-300 rounded px-3 py-2 cursor-pointer text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  id="income-proof"
                />
                {incomeProof && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {incomeProof.name}
                  </p>
                )}
              </div>
              {errors.income_proof && (
                <p className="text-red-500 text-sm mt-1">
                  {typeof errors.income_proof.message === 'string' ? errors.income_proof.message : 'Income proof is required'}
                </p>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your application will be reviewed and forwarded to our 
              partner financial institutions. You will be contacted within 2-3 business days 
              with feedback on your application.
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
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FinancingModal;