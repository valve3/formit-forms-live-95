
-- Add layout_settings column to the forms table
ALTER TABLE public.forms 
ADD COLUMN layout_settings JSONB DEFAULT '{
  "type": "single",
  "columns": 1,
  "rows": 1,
  "columnGap": 16,
  "rowGap": 16,
  "breakpoints": {
    "mobile": 1,
    "tablet": 2,
    "desktop": 3
  }
}'::jsonb;
