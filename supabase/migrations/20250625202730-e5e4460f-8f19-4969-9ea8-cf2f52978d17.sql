
-- Update RLS policies to allow public access to published forms and their fields
-- This is necessary for embedding forms on external websites

-- Allow anyone to view published forms (not just form owners)
CREATE POLICY "Anyone can view published forms" ON public.forms
    FOR SELECT USING (status = 'published');

-- Allow anyone to view fields of published forms
CREATE POLICY "Anyone can view fields of published forms" ON public.form_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.forms 
            WHERE forms.id = form_fields.form_id 
            AND forms.status = 'published'
        )
    );
