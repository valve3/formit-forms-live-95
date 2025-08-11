
-- Add extracted_palettes column to forms table
ALTER TABLE public.forms 
ADD COLUMN extracted_palettes JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN public.forms.extracted_palettes IS 'Stores extracted color palettes from websites as JSON array';
