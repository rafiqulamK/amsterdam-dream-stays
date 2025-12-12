-- Drop the restrictive policy and create a permissive one for public property viewing
DROP POLICY IF EXISTS "Everyone can view approved properties" ON properties;

-- Create permissive policy for viewing approved properties (allows public access)
CREATE POLICY "Everyone can view approved properties"
ON properties
FOR SELECT
TO anon, authenticated
USING (
  status = 'approved'
  OR owner_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure the policy is PERMISSIVE (default) so it allows access without requiring all conditions