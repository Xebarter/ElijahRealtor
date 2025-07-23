import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Upload, X } from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';
import type { Testimonial } from '@/types';

const testimonialSchema = z.object({
  client_name: z.string().min(2, 'Client name is required'),
  client_title: z.string().optional(),
  country: z.string().optional(),
  rating: z.number().min(1).max(5),
  content: z.string().min(10, 'Testimonial content is required'),
  type: z.enum(['text', 'image', 'video']),
});

interface TestimonialFormProps {
  testimonial?: Testimonial | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const TestimonialForm = ({ testimonial, onSubmit, onCancel, loading }: TestimonialFormProps) => {
  const [rating, setRating] = useState(testimonial?.rating || 0);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>(testimonial?.media_urls || []);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      client_name: testimonial?.client_name || '',
      client_title: testimonial?.client_title || '',
      country: testimonial?.country || '',
      rating: testimonial?.rating || 0,
      content: testimonial?.content || '',
      type: testimonial?.type || 'text',
    },
  });

  const handleFormSubmit = (data: any) => {
    onSubmit({ ...data, rating, media_urls: existingMedia, new_media: mediaFiles });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="client_name"
              control={control}
              render={({ field }) => <Input placeholder="Client Name" {...field} />}
            />
            <Controller
              name="client_title"
              control={control}
              render={({ field }) => <Input placeholder="Client Title (e.g. CEO, Homeowner)" {...field} />}
            />
          </div>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex items-center space-x-1 mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <Controller
            name="content"
            control={control}
            render={({ field }) => <Textarea placeholder="Testimonial Content" {...field} rows={5} />}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Testimonial Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Media (Images/Videos)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload files</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={e => setMediaFiles(Array.from(e.target.files || []))} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB; MP4, WEBM up to 50MB</p>
              </div>
            </div>
            {existingMedia.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium">Existing Media:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {existingMedia.map(url => (
                    <div key={url} className="relative">
                      <img src={url} alt="" className="h-20 w-20 object-cover rounded-md" />
                      <button type="button" onClick={() => setExistingMedia(existingMedia.filter(m => m !== url))} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mediaFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium">New Media:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mediaFiles.map(file => (
                    <div key={file.name} className="relative">
                      <img src={URL.createObjectURL(file)} alt="" className="h-20 w-20 object-cover rounded-md" />
                      <button type="button" onClick={() => setMediaFiles(mediaFiles.filter(f => f.name !== file.name))} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Testimonial'}</Button>
      </div>
    </form>
  );
};

export default TestimonialForm;