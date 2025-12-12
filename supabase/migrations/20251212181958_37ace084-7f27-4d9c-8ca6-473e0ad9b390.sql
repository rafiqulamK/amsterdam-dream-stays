-- Add videos column to properties table for video uploads
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}';

-- Create media storage bucket for property images and videos (50MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('media', 'media', true, 52428800)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for media bucket
CREATE POLICY "Public can view media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));