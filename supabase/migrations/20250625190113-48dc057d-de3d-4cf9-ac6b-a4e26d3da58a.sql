
-- Create enum types for better data validation
CREATE TYPE field_type AS ENUM (
    'text', 'email', 'number', 'textarea', 'select', 
    'radio', 'checkbox', 'date', 'file', 'url', 'tel'
);

CREATE TYPE form_status AS ENUM ('draft', 'published', 'archived');

-- Create profiles table for user management
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forms table
CREATE TABLE public.forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status form_status DEFAULT 'draft',
    theme_settings JSONB DEFAULT '{}',
    email_settings JSONB DEFAULT '{}',
    embed_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form fields table
CREATE TABLE public.form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
    field_type field_type NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    required BOOLEAN DEFAULT false,
    options JSONB, -- For select, radio, checkbox options
    validation_rules JSONB DEFAULT '{}',
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form submissions table
CREATE TABLE public.form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
    submission_data JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for forms
CREATE POLICY "Users can view own forms" ON public.forms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create forms" ON public.forms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms" ON public.forms
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms" ON public.forms
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for form fields
CREATE POLICY "Users can manage fields of own forms" ON public.form_fields
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.forms 
            WHERE forms.id = form_fields.form_id 
            AND forms.user_id = auth.uid()
        )
    );

-- RLS Policies for form submissions
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

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON public.forms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
