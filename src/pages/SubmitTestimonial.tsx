import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Upload, X, ArrowLeft, Send, Image, Video, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import SEO from '@/components/common/SEO';
import { useTestimonials } from '@/hooks/useTestimonials';
import { COUNTRIES } from '@/lib/countries';
import { z } from 'zod';

const testimonialSchema = z.object({
  client_name: z.string().min(2, 'Name must be at least 2 characters'),
  client_title: z.string().optional(),
  content: z.string().min(10, 'Testimonial must be at least 10 characters'),
  rating: z.number().min(1).max(5),
  country: z.string().optional(),
  type: z.enum(['text', 'image', 'video']),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

const SubmitTestimonial = () => {
  const navigate = useNavigate();
  const { submitTestimonial, uploadTestimonialMedia } = useTestimonials();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [rating, setRating] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreImagesRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      type: 'text',
      rating: 5,
    },
  });

  const watchType = watch('type');

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const maxFiles = watchType === 'video' ? 1 : 3;
    
    // If adding more files, check if we'd exceed the limit
    if (selectedFiles.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed for ${watchType} testimonials`);
      return;
    }

    // Validate file types
    const validFiles = fileArray.filter(file => {
      if (watchType === 'image') {
        return file.type.startsWith('image/');
      } else if (watchType === 'video') {
        return file.type.startsWith('video/');
      }
      return false;
    });

    if (validFiles.length !== fileArray.length) {
      toast.error(`Please select valid ${watchType} files only`);
      return;
    }

    // Check file sizes
    const maxSize = watchType === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for video, 5MB for images
    const oversizedFiles = validFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error(`File size must be less than ${watchType === 'video' ? '50MB' : '5MB'}`);
      return;
    }

    // Add to existing files
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Reset file input value to allow selecting the same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (addMoreImagesRef.current) addMoreImagesRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (addMoreImagesRef.current) addMoreImagesRef.current.value = '';
  };

  const onSubmit = async (data: TestimonialFormData) => {
    setIsSubmitting(true);
    
    try {
      let mediaUrls: string[] = [];
      
      // Upload files if any are selected
      if (selectedFiles.length > 0) {
        setUploadProgress(0);
        mediaUrls = await uploadTestimonialMedia(selectedFiles);
        setUploadProgress(100);
      }

      // Submit testimonial
      await submitTestimonial({
        client_name: data.client_name,
        client_title: data.client_title,
        content: data.content,
        rating: data.rating,
        country: data.country,
        type: data.type,
        media_urls: mediaUrls,
      });

      toast.success('Thank you! Your testimonial has been submitted for review.');
      navigate('/testimonials');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit testimonial. Please try again.');
      console.error('Testimonial submission error:', error);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const renderStars = (currentRating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => {
          setRating(index + 1);
          setValue('rating', index + 1);
        }}
        className={`w-10 h-10 md:w-12 md:h-12 ${
          index < currentRating ? 'text-yellow-400' : 'text-gray-300'
        } hover:text-yellow-500 transition-colors`}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        aria-label={`Rate ${index + 1} star${index === 0 ? '' : 's'}`}
      >
        <Star className="w-full h-full" fill={index < currentRating ? '#FFD700' : 'none'} />
      </button>
    ));
  };

  const getFileTypeIcon = () => {
    switch (watchType) {
      case 'image':
        return <Image className="w-8 h-8 text-gray-400" />;
      case 'video':
        return <Video className="w-8 h-8 text-gray-400" />;
      default:
        return <MessageSquare className="w-8 h-8 text-gray-400" />;
    }
  };

  const getAcceptedFileTypes = () => {
    switch (watchType) {
      case 'image':
        return 'image/jpeg,image/png,image/jpg,image/webp';
      case 'video':
        return 'video/mp4,video/quicktime,video/webm';
      default:
        return '';
    }
  };

  // Handle type change to clear selected files
  React.useEffect(() => {
    clearFiles();
  }, [watchType]);

  return (
    <>
      <SEO
        title="Submit Your Testimonial"
        description="Share your experience with ElijahRealtor. Submit your testimonial and help others make informed decisions about their property journey."
        keywords="submit testimonial, client feedback, property experience, ElijahRealtor review"
      />

      <div className="min-h-screen bg-bg-primary py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/testimonials" 
              className="inline-flex items-center text-primary-navy hover:text-primary-gold transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Testimonials
            </Link>
            <h1 className="text-3xl font-bold text-primary-navy mb-2">Share Your Experience</h1>
            <p className="text-gray-600">
              Help others by sharing your experience with ElijahRealtor. Your testimonial will be reviewed before being published.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="w-5 h-5 mr-2 text-primary-gold" />
                Submit Your Testimonial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Title/Role (Optional)
                      </label>
                      <Input
                        {...register('client_title')}
                        placeholder="e.g., Property Investor, First-time Buyer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country (Optional)
                    </label>
                    <Select onValueChange={(value) => setValue('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Testimonial Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Testimonial Type *
                  </label>
                  <Select 
                    value={watchType} 
                    onValueChange={(value: 'text' | 'image' | 'video') => setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select testimonial type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="image">Text + Images</SelectItem>
                      <SelectItem value="video">Text + Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center space-x-1">
                    {renderStars(rating)}
                    <span className="ml-3 text-sm text-gray-600">
                      {rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* Testimonial Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Testimonial *
                  </label>
                  <Textarea
                    {...register('content')}
                    placeholder="Share your experience with ElijahRealtor. What made your property journey special?"
                    rows={5}
                    className={errors.content ? 'border-red-500' : ''}
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                  )}
                </div>

                {/* Media Upload */}
                {(watchType === 'image' || watchType === 'video') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload {watchType === 'image' ? 'Images' : 'Video'} (Optional)
                    </label>
                    
                    {selectedFiles.length === 0 ? (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-gold transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {getFileTypeIcon()}
                        <p className="text-gray-600 mt-2 mb-4">
                          {watchType === 'image' 
                            ? 'Upload up to 3 images (JPG, PNG, max 5MB each)'
                            : 'Upload 1 video file (MP4, MOV, max 50MB)'
                          }
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          multiple={watchType === 'image'}
                          accept={getAcceptedFileTypes()}
                          onChange={(e) => handleFileSelect(e.target.files)}
                          className="hidden"
                          id="media-upload"
                        />
                        <Button type="button" variant="outline" className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Select {watchType === 'image' ? 'Images' : 'Video'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                {watchType === 'image' ? (
                                  <Image className="w-5 h-5 text-primary-gold mr-3" />
                                ) : (
                                  <Video className="w-5 h-5 text-primary-gold mr-3" />
                                )}
                                <div>
                                  <p className="font-medium text-sm">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(1)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        {watchType === 'image' && selectedFiles.length < 3 && (
                          <div>
                            <input
                              type="file"
                              ref={addMoreImagesRef}
                              multiple
                              accept={getAcceptedFileTypes()}
                              onChange={(e) => handleFileSelect(e.target.files)}
                              className="hidden"
                              id="add-more-images"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="cursor-pointer"
                              onClick={() => addMoreImagesRef.current?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Add More Images
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading files...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Guidelines */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Submission Guidelines:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be honest and specific about your experience</li>
                    <li>• Include details about the service you received</li>
                    <li>• Mention the property type or location if relevant</li>
                    <li>• Keep content appropriate and professional</li>
                    <li>• Your testimonial will be reviewed before publication</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/testimonials')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn-primary"
                    variant="default"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SubmitTestimonial;