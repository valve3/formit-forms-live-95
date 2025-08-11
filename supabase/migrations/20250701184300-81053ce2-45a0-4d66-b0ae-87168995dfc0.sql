
-- Phase 1: Fix Critical Database Security Issues (Updated)

-- First, drop any existing broken RLS policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a security definer function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create proper RLS policies for profiles table (non-recursive)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Drop and recreate existing policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can create forms" ON public.forms;
DROP POLICY IF EXISTS "Users can update own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can delete own forms" ON public.forms;
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;

DROP POLICY IF EXISTS "Users can manage fields of own forms" ON public.form_fields;
DROP POLICY IF EXISTS "Anyone can view fields of published forms" ON public.form_fields;

DROP POLICY IF EXISTS "Users can view submissions of own forms" ON public.form_submissions;
DROP POLICY IF EXISTS "Anyone can submit to published forms" ON public.form_submissions;

-- Create comprehensive RLS policies for forms table
CREATE POLICY "Users can view own forms" ON public.forms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create forms" ON public.forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms" ON public.forms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms" ON public.forms
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published forms" ON public.forms
  FOR SELECT USING (status = 'published');

-- Create RLS policies for form_fields table
CREATE POLICY "Users can manage fields of own forms" ON public.form_fields
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.forms 
      WHERE forms.id = form_fields.form_id 
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view fields of published forms" ON public.form_fields
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forms 
      WHERE forms.id = form_fields.form_id 
      AND forms.status = 'published'
    )
  );

-- Create RLS policies for form_submissions table
CREATE POLICY "Users can view submissions of own forms" ON public.form_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forms 
      WHERE forms.id = form_submissions.form_id 
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can submit to published forms" ON public.form_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms 
      WHERE forms.id = form_submissions.form_id 
      AND forms.status = 'published'
    )
  );

-- Add rate limiting table for form submissions
CREATE TABLE IF NOT EXISTS public.submission_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE,
  submission_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on rate limiting table
ALTER TABLE public.submission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for rate limiting (only system can manage this)
CREATE POLICY "System can manage rate limits" ON public.submission_rate_limits
  FOR ALL USING (false);

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_submission_rate_limit(
  p_ip_address INET,
  p_form_id UUID,
  p_max_submissions INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start time
  window_start_time := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Clean up old entries
  DELETE FROM public.submission_rate_limits 
  WHERE window_start < window_start_time;
  
  -- Get current count for this IP and form
  SELECT COALESCE(SUM(submission_count), 0) INTO current_count
  FROM public.submission_rate_limits
  WHERE ip_address = p_ip_address 
    AND form_id = p_form_id 
    AND window_start >= window_start_time;
  
  -- Check if limit exceeded
  IF current_count >= p_max_submissions THEN
    RETURN FALSE;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO public.submission_rate_limits (ip_address, form_id, submission_count, window_start)
  VALUES (p_ip_address, p_form_id, 1, NOW())
  ON CONFLICT (ip_address, form_id) 
  DO UPDATE SET 
    submission_count = submission_rate_limits.submission_count + 1,
    window_start = CASE 
      WHEN submission_rate_limits.window_start < window_start_time 
      THEN NOW() 
      ELSE submission_rate_limits.window_start 
    END;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint for rate limiting (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_ip_form_window'
  ) THEN
    ALTER TABLE public.submission_rate_limits 
    ADD CONSTRAINT unique_ip_form_window 
    UNIQUE (ip_address, form_id);
  END IF;
END$$;
