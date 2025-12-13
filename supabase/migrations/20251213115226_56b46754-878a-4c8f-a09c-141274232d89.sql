-- Fix remaining RLS policies

-- Drop the conflicting policy first
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate with correct name
CREATE POLICY "Admins can view all user profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));