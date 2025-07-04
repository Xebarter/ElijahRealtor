import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Upload, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { financingSchema } from '@/lib/validations';
import { COUNTRIES } from '@/lib/countries';
import type { Property, FinancingForm } from '@/types';
import type { z } from 'zod';

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

  const country = COUNTRIES.find(c => c.name === property.country);

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
      currency: property.currency,
    },
  });

  const watchCurrency = watch('currency');

  const onSubmit = async (data: FinancingFormData) => {
    if (!idDocument || !incomeProof) {
      toast.error('Please upload all required documents');
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, upload files to Supabase Storage and submit application
      const applicationData = {
        ...data,
        id_document_url: 'uploaded_id_document_url',
        income_proof_url: 'uploaded_income_proof_url',
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

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

  const handleFileUpload = (file: File, type: 'id' | 'income') => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    if (type === 'id') {
      setIdDocument(file);
      setValue('id_document', file);
    } else {
      setIncomeProof(file);
      setValue('income_proof', file);
    }
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <Input
                {...register('applicant_name')}
                placeholder="Enter your full name"
                className={errors.applicant_name ? 'border-red-500' : ''}
              />
              {errors.applicant_name && (
                <p className="text-red-500 text-sm mt-1">{errors.applicant_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                {...register('applicant_email')}
                placeholder="Enter your email"
                className={errors.applicant_email ? 'border-red-500' : ''}
              />
              {errors.applicant_email && (
                <p className="text-red-500 text-sm mt-1">{errors.applicant_email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <Input
                type="tel"
                {...register('applicant_phone')}
                placeholder="Enter your phone number"
                className={errors.applicant_phone ? 'border-red-500' : ''}
              />
              {errors.applicant_phone && (
                <p className="text-red-500 text-sm mt-1">{errors.applicant_phone.message}</p>
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
                ID Document (Passport/National ID) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'id');
                  }}
                  className="hidden"
                  id="id-document"
                />
                <label
                  htmlFor="id-document"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {idDocument ? idDocument.name : 'Click to upload ID document'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG (max 5MB)
                  </span>
                </label>
              </div>
              {errors.id_document && (
                <p className="text-red-500 text-sm mt-1">{errors.id_document.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Income Proof (Payslip/Bank Statement) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'income');
                  }}
                  className="hidden"
                  id="income-proof"
                />
                <label
                  htmlFor="income-proof"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FileText className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {incomeProof ? incomeProof.name : 'Click to upload income proof'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG (max 5MB)
                  </span>
                </label>
              </div>
              {errors.income_proof && (
                <p className="text-red-500 text-sm mt-1">{errors.income_proof.message}</p>
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