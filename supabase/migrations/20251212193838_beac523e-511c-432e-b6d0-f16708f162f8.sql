-- Add source column to leads table for tracking lead origin
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source text DEFAULT 'property_form';

-- Add comment for documentation
COMMENT ON COLUMN public.leads.source IS 'Lead source: property_form, homepage_form, blog, tour_completion, exit_intent';