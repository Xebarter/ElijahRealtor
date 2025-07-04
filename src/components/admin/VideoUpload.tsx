import React, { useState, useCallback } from 'react';
import { Video, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useVideoUpload } from '@/hooks/usePropertyMedia';

interface VideoUploadProps {
  propertyId?: string;
  currentVideoUrl?: string;
  onVideoChange?: (videoUrl: string | null) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  propertyId,
  currentVideoUrl,
  onVideoChange
}) => {
  const [videoUrl, setVideoUrl] = useState(currentVideoUrl || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const { uploading, uploadVideo } = useVideoUpload();

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || !propertyId) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('Video file size must be less than 100MB');
      return;
    }

    try {
      setUploadProgress(0);
      const uploadedVideoUrl = await uploadVideo(file, propertyId);
      setVideoUrl(uploadedVideoUrl);
      onVideoChange?.(uploadedVideoUrl);
      setUploadProgress(100);
    } catch (error) {
      console.error('Video upload failed:', error);
      setUploadProgress(0);
    }
  }, [propertyId, uploadVideo, onVideoChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    onVideoChange?.(url || null);
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
    onVideoChange?.(null);
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const isVimeoUrl = (url: string) => {
    return url.includes('vimeo.com');
  };

  const getEmbedUrl = (url: string) => {
    if (isYouTubeUrl(url)) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    
    if (isVimeoUrl(url)) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    
    return url;
  };

  const renderVideoPreview = () => {
    if (!videoUrl) return null;

    if (isYouTubeUrl(videoUrl) || isVimeoUrl(videoUrl)) {
      return (
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={getEmbedUrl(videoUrl)}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // For direct video files
    return (
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-cover"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Video className="w-5 h-5 mr-2 text-primary-gold" />
          Property Video Tour
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL (YouTube, Vimeo, or direct link)
          </label>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
              value={videoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="flex-1"
            />
            {videoUrl && (
              <Button
                variant="outline"
                onClick={handleRemoveVideo}
                className="px-3"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* OR Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* File Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-primary-gold bg-primary-gold/10' 
              : 'border-gray-300 hover:border-primary-gold'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Upload Video File
          </p>
          <p className="text-gray-600 mb-4">
            Drag and drop a video file here, or click to select
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supported formats: MP4, MOV, AVI (Max size: 100MB)
          </p>
          
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="video-upload"
            disabled={uploading}
          />
          <label htmlFor="video-upload">
            <Button 
              type="button" 
              className="btn-primary"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Select Video File'
              )}
            </Button>
          </label>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading video...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Video Preview */}
        {videoUrl && !uploading && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Video Preview</h4>
            {renderVideoPreview()}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {isYouTubeUrl(videoUrl) && 'YouTube Video'}
                {isVimeoUrl(videoUrl) && 'Vimeo Video'}
                {!isYouTubeUrl(videoUrl) && !isVimeoUrl(videoUrl) && 'Direct Video File'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveVideo}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Video Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• YouTube and Vimeo links are recommended for better performance</li>
            <li>• Keep videos under 5 minutes for better engagement</li>
            <li>• Ensure good lighting and stable footage</li>
            <li>• Include key features like rooms, views, and amenities</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;