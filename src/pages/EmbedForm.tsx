import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from "@/components/ui/toaster";
import { useConditionalLogic } from '@/hooks/useConditionalLogic';
import { validateFormData, sanitizeInput, sanitizeEmail } from '@/utils/security';
import EmbedFormHeader from '@/components/embed/EmbedFormHeader';
import FormFieldRenderer from '@/components/embed/FormFieldRenderer';
import SecurityVerification from '@/components/embed/SecurityVerification';
import ThemeStyles from '@/components/embed/ThemeStyles';
import LoadingStates from '@/components/embed/LoadingStates';
import { FormTheme, LogoData, LogoSettings } from '@/types/theme';

interface FormField {
  id: string;
  field_type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  position: number;
}

interface LayoutSettings {
  type: 'single' | 'grid';
  columns: number;
  rows: number;
  columnGap: number;
  rowGap: number;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

interface Form {
  id: string;
  title: string;
  description: string;
  status: string;
  email_settings?: {
    enabled?: boolean;
    emails?: string[];
  };
  theme_settings?: FormTheme;
  layout_settings?: LayoutSettings;
}

const EmbedForm = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const { toast } = useToast();

  // Use conditional logic hook - removed the custom rules that were causing issues
  const { canSubmit, visibleFields, isValidEmail } = useConditionalLogic({
    formData,
    fields,
    rules: [] // Removed problematic rules
  });

  // Check if CAPTCHA is enabled for this form - default to false if not set
  const isCaptchaEnabled = form?.theme_settings?.captcha_enabled === true;

  useEffect(() => {
    if (formId) {
      fetchForm();
      fetchFields();
    }
  }, [formId]);

  // Set CAPTCHA as verified by default if it's not enabled
  useEffect(() => {
    if (!isCaptchaEnabled) {
      setCaptchaVerified(true);
    } else {
      setCaptchaVerified(false);
    }
  }, [isCaptchaEnabled]);

  const fetchForm = async () => {
    try {
      console.log('Fetching form with ID:', formId);
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (error) {
        console.error('Error fetching form:', error);
        throw error;
      }
      
      console.log('Form data:', data);
      console.log('Email settings from DB:', data.email_settings);
      
      // Type cast email_settings properly
      const formData: Form = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        status: data.status || 'draft',
        email_settings: data.email_settings ? data.email_settings as { enabled?: boolean; emails?: string[]; } : undefined,
        theme_settings: data.theme_settings ? data.theme_settings as FormTheme : undefined
      };
      
      console.log('Processed form data:', formData);
      setForm(formData);
    } catch (error: any) {
      console.error('Error fetching form:', error);
    }
  };

  const fetchFields = async () => {
    try {
      console.log('Fetching fields for form:', formId);
      const { data, error } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('position');

      if (error) {
        console.error('Error fetching fields:', error);
        throw error;
      }
      
      console.log('Fields data:', data);
      const transformedFields: FormField[] = (data || []).map(field => ({
        id: field.id,
        field_type: field.field_type,
        label: field.label,
        placeholder: field.placeholder || undefined,
        required: field.required || false,
        options: field.options ? (Array.isArray(field.options) ? field.options as string[] : JSON.parse(field.options as string)) : undefined,
        position: field.position,
      }));
      
      setFields(transformedFields);
    } catch (error: any) {
      console.error('Error fetching fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRateLimit = async () => {
    try {
      // Get client IP (in a real implementation, this would be handled server-side)
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();
      
      const { data, error } = await supabase.rpc('check_submission_rate_limit', {
        p_ip_address: ip,
        p_form_id: formId,
        p_max_submissions: 5, // Allow 5 submissions per hour
        p_window_minutes: 60
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow submission if rate limit check fails
      }

      return data;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow submission if rate limit check fails
    }
  };

  const sendEmailNotifications = async (submissionData: Record<string, any>) => {
    if (!form?.email_settings?.enabled || !form?.email_settings?.emails) {
      return;
    }

    try {
      for (const email of form.email_settings.emails) {
        const sanitizedEmail = sanitizeEmail(email.trim());
        if (sanitizedEmail && isValidEmail(sanitizedEmail)) {
          const { data, error } = await supabase.functions.invoke('send-form-email', {
            body: {
              to: sanitizedEmail,
              formTitle: sanitizeInput(form.title),
              submissionData: Object.fromEntries(
                Object.entries(submissionData).map(([key, value]) => [
                  key, 
                  typeof value === 'string' ? sanitizeInput(value) : value
                ])
              ),
              submittedAt: new Date().toISOString(),
              formId: form.id,
            },
          });

          if (error) {
            console.error('Error sending email to', sanitizedEmail, ':', error);
          }
        }
      }
    } catch (error: any) {
      console.error('Error sending email notifications:', error);
      toast({
        title: 'Warning',
        description: 'Form submitted successfully, but email notification failed to send.',
        variant: 'destructive',
      });
    }
  };

  const verifyCaptcha = async () => {
    if (!captchaToken) {
      toast({
        title: 'CAPTCHA Error',
        description: 'Please complete the security check first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-captcha', {
        body: { token: captchaToken }
      });

      if (error) throw error;

      setCaptchaVerified(true);
      toast({
        title: 'CAPTCHA Verified',
        description: 'You can now submit the form.',
      });
    } catch (error: any) {
      toast({
        title: 'CAPTCHA Error',
        description: 'Security verification failed. Please try again.',
        variant: 'destructive',
      });
      setCaptchaToken(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission attempted. Can submit:', canSubmit, 'CAPTCHA enabled:', isCaptchaEnabled, 'CAPTCHA verified:', captchaVerified);
    
    if (!canSubmit) {
      toast({
        title: 'Form Incomplete',
        description: 'Please complete all required fields with valid information.',
        variant: 'destructive',
      });
      return;
    }

    if (isCaptchaEnabled && !captchaVerified) {
      toast({
        title: 'Security Check Required',
        description: 'Please complete the security verification.',
        variant: 'destructive',
      });
      return;
    }

    // Check rate limiting
    const rateLimitPassed = await checkRateLimit();
    if (!rateLimitPassed) {
      setRateLimited(true);
      toast({
        title: 'Rate Limit Exceeded',
        description: 'Too many submissions. Please try again later.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Validate and sanitize form data
      const { isValid, errors } = validateFormData(formData, fields);
      
      if (!isValid) {
        toast({
          title: 'Validation Error',
          description: errors.join(', '),
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Sanitize form data before submission
      const sanitizedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          typeof value === 'string' ? sanitizeInput(value) : value
        ])
      );

      // Submit to database
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formId,
          submission_data: sanitizedData,
        });

      if (error) throw error;

      // Send email notifications
      await sendEmailNotifications(sanitizedData);

      setSubmitted(true);
      toast({
        title: 'Success',
        description: 'Form submitted successfully!',
      });
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (fieldId: string, value: any) => {
    // Don't sanitize during input to preserve spaces - sanitization happens on submission
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const getFieldValidationState = (field: FormField) => {
    const value = formData[field.id];
    if (field.field_type === 'email' && value) {
      return isValidEmail(value) ? 'valid' : 'invalid';
    }
    return 'normal';
  };

  if (loading) {
    return <LoadingStates type="loading" />;
  }

  if (!form) {
    return (
      <LoadingStates 
        type="not-found" 
        title="Form Not Found" 
        message="This form is not available." 
      />
    );
  }

  if (submitted) {
    return (
      <div className="themed-form-container">
        <ThemeStyles theme={form?.theme_settings} />
        <LoadingStates type="success" />
        <Toaster />
      </div>
    );
  }

  if (rateLimited) {
    return (
      <LoadingStates 
        type="rate-limited" 
        title="Rate Limited" 
        message="Too many submissions. Please try again later." 
      />
    );
  }

  return (
    <div className="themed-form-container">
      <ThemeStyles theme={form?.theme_settings} layout={form?.layout_settings} />
      <div className="themed-form-card">
        <EmbedFormHeader
          title={form.title}
          description={form.description}
          logo={form?.theme_settings?.logo}
          logoSettings={form?.theme_settings?.logoSettings}
        />
        
        <form onSubmit={handleSubmit}>
          <div 
            className={
              form?.layout_settings?.type === 'grid' 
                ? 'form-grid-layout' 
                : 'space-y-6'
            }
          >
            {fields
              .filter(field => visibleFields.includes(field.id))
              .map((field) => (
                <FormFieldRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={updateFormData}
                  validationState={getFieldValidationState(field)}
                />
              ))}
          </div>
          
          {/* Only show CAPTCHA if it's enabled */}
          {isCaptchaEnabled && (
            <SecurityVerification
              captchaVerified={captchaVerified}
              captchaToken={captchaToken}
              onCaptchaTokenChange={setCaptchaToken}
              onVerifyCaptcha={verifyCaptcha}
            />
          )}

          <button 
            type="submit" 
            className="themed-form-button mt-6"
            disabled={submitting || !canSubmit || (isCaptchaEnabled && !captchaVerified)}
          >
            {submitting ? 'Submitting...' : 'Submit Form'}
          </button>
          
          {(!canSubmit || (isCaptchaEnabled && !captchaVerified)) && (
            <p className="text-orange-600 text-sm mt-2 text-center">
              Please complete all required fields{isCaptchaEnabled && !captchaVerified ? ' and security verification' : ''}
            </p>
          )}
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default EmbedForm;
