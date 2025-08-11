
-- Add page column to form_fields table to support multi-page forms
ALTER TABLE public.form_fields 
ADD COLUMN page INTEGER DEFAULT 0;

-- Add a comment to document the column
COMMENT ON COLUMN public.form_fields.page IS 'Page number for multi-page forms, defaults to 0 for single page forms';
