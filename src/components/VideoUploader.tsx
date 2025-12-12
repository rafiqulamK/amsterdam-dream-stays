import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Video, X, Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoUploaderProps {
  videos: string[];
  onVideosChange: (videos: string[]) => void;
  maxVideos?: number;
  className?: string;
}

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const VideoUploader = ({
  videos,
  onVideosChange,
  maxVideos = 3,
  className,
}: VideoUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxVideos - videos.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'Limit reached',
        description: `Maximum ${maxVideos} videos allowed`,
        variant: 'destructive',
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    const invalidFiles = filesToUpload.filter(
      (file) =>
        !ALLOWED_VIDEO_TYPES.includes(file.type) || file.size > MAX_VIDEO_SIZE
    );

    if (invalidFiles.length > 0) {
      toast({
        title: 'Invalid files',
        description: 'Only MP4, WebM, MOV files under 50MB are allowed',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (error) {
        toast({
          title: 'Upload Error',
          description: `Failed to upload ${file.name}`,
          variant: 'destructive',
        });
      } else if (data) {
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
        uploadedUrls.push(urlData.publicUrl);
      }

      setUploadProgress(((i + 1) / filesToUpload.length) * 100);
    }

    if (uploadedUrls.length > 0) {
      onVideosChange([...videos, ...uploadedUrls]);
      toast({
        title: 'Success',
        description: `${uploadedUrls.length} video(s) uploaded`,
      });
    }

    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeVideo = (index: number) => {
    onVideosChange(videos.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload area */}
      <div
        className={cn(
          'border-2 border-dashed border-border rounded-lg p-6 text-center',
          'hover:border-primary/50 transition-colors cursor-pointer',
          videos.length >= maxVideos && 'opacity-50 pointer-events-none'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
        <Video className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium">Click to upload videos</p>
        <p className="text-xs text-muted-foreground">
          MP4, WebM, MOV up to 50MB ({videos.length}/{maxVideos})
        </p>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading videos...
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Video previews */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map((url, index) => (
            <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-muted">
              <video
                src={url}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => removeVideo(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs">
                Video {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
