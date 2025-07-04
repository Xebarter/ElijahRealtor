import React, { useState } from 'react';
import { Play, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertyVideoPlayerProps {
  videoUrl?: string;
  title?: string;
  className?: string;
}

const PropertyVideoPlayer: React.FC<PropertyVideoPlayerProps> = ({
  videoUrl,
  title = 'Property Video Tour',
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!videoUrl) {
    return null;
  }

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const isVimeoUrl = (url: string) => {
    return url.includes('vimeo.com');
  };

  const getEmbedUrl = (url: string) => {
    if (isYouTubeUrl(url)) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : url;
    }
    
    if (isVimeoUrl(url)) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=0` : url;
    }
    
    return url;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const renderVideoPlayer = () => {
    if (isYouTubeUrl(videoUrl) || isVimeoUrl(videoUrl)) {
      return (
        <div className="relative w-full h-full">
          <iframe
            src={getEmbedUrl(videoUrl)}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        </div>
      );
    }

    // For direct video files
    return (
      <div className="relative w-full h-full group">
        <video
          src={videoUrl}
          className="w-full h-full object-cover"
          controls
          preload="metadata"
          poster={undefined} // You could add a poster image here
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onVolumeChange={(e) => {
            const video = e.target as HTMLVideoElement;
            setIsMuted(video.muted);
          }}
        >
          Your browser does not support the video tag.
        </video>

        {/* Custom Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const video = document.querySelector('video');
                  if (video) {
                    if (isPlaying) {
                      video.pause();
                    } else {
                      video.play();
                    }
                  }
                }}
                className="text-white hover:bg-white/20"
              >
                <Play className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const video = document.querySelector('video');
                  if (video) {
                    video.muted = !video.muted;
                    setIsMuted(video.muted);
                  }
                }}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Play className="w-5 h-5 mr-2 text-primary-gold" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="aspect-video bg-gray-900 rounded-b-lg overflow-hidden">
          {renderVideoPlayer()}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyVideoPlayer;