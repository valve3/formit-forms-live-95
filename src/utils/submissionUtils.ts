
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, validateFormData } from './security';

export interface FormField {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
}

// Cache for form fields to avoid repeated API calls
const formFieldsCache = new Map<string, FormField[]>();

export const getFormFields = async (formId: string): Promise<FormField[]> => {
  if (formFieldsCache.has(formId)) {
    return formFieldsCache.get(formId)!;
  }

  try {
    const { data, error } = await supabase
      .from('form_fields')
      .select('id, label, field_type, required')
      .eq('form_id', formId)
      .order('position');

    if (error) throw error;

    const fields = (data || []).map(field => ({
      ...field,
      label: sanitizeInput(field.label)
    }));
    
    formFieldsCache.set(formId, fields);
    return fields;
  } catch (error) {
    console.error('Error fetching form fields:', error);
    return [];
  }
};

export const transformSubmissionData = (submissionData: any, formFields: FormField[]) => {
  const fieldMap = new Map(formFields.map(field => [field.id, field.label]));
  const transformed: Record<string, any> = {};

  Object.entries(submissionData).forEach(([fieldId, value]) => {
    const fieldLabel = fieldMap.get(fieldId) || fieldId;
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    transformed[fieldLabel] = sanitizedValue;
  });

  return transformed;
};

export const validateAndSanitizeSubmission = (
  submissionData: Record<string, any>, 
  formFields: FormField[]
): { isValid: boolean; sanitizedData: Record<string, any>; errors: string[] } => {
  
  // Validate the form data
  const validation = validateFormData(submissionData, formFields);
  
  // Sanitize the data
  const sanitizedData = Object.fromEntries(
    Object.entries(submissionData).map(([key, value]) => [
      key,
      typeof value === 'string' ? sanitizeInput(value) : value
    ])
  );

  return {
    isValid: validation.isValid,
    sanitizedData,
    errors: validation.errors
  };
};

export const getSubmissionChartData = (submissions: any[]) => {
  // Group submissions by date and form
  const chartData = new Map<string, Map<string, number>>();

  submissions.forEach(submission => {
    const date = new Date(submission.submitted_at).toLocaleDateString();
    const formTitle = sanitizeInput(submission.forms?.title || 'Unknown Form');

    if (!chartData.has(date)) {
      chartData.set(date, new Map());
    }

    const dateMap = chartData.get(date)!;
    dateMap.set(formTitle, (dateMap.get(formTitle) || 0) + 1);
  });

  // Convert to array format for recharts
  const result = Array.from(chartData.entries()).map(([date, forms]) => {
    const dataPoint: any = { date };
    forms.forEach((count, formTitle) => {
      dataPoint[formTitle] = count;
    });
    return dataPoint;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return result;
};

// Rate limiting check function
export const checkSubmissionRateLimit = async (
  formId: string, 
  maxSubmissions: number = 5, 
  windowMinutes: number = 60
): Promise<boolean> => {
  try {
    // Get client IP
    const response = await fetch('https://api.ipify.org?format=json');
    const { ip } = await response.json();
    
    const { data, error } = await supabase.rpc('check_submission_rate_limit', {
      p_ip_address: ip,
      p_form_id: formId,
      p_max_submissions: maxSubmissions,
      p_window_minutes: windowMinutes
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow submission if check fails
    }

    return data;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow submission if check fails
  }
};
