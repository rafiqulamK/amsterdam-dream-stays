import { useState, useRef } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

const VideoPlayer = ({
  src,
  poster,
  className,
  autoPlay = false,
  muted = true,
  loop = true,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden bg-muted',
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Play button overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-background/30 transition-opacity"
        >
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors">
            <Play className="w-7 h-7 text-primary-foreground ml-1" />
          </div>
        </button>
      )}

      {/* Controls bar */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent',
          'transition-opacity duration-300',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full hover:bg-background/50 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-foreground" />
            ) : (
              <Play className="w-5 h-5 text-foreground" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-background/50 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-foreground" />
            ) : (
              <Volume2 className="w-5 h-5 text-foreground" />
            )}
          </button>

          <div className="flex-1" />

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-background/50 transition-colors"
          >
            <Maximize className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
