
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type FieldType = Database['public']['Enums']['field_type'];

interface FormField {
  id: string;
  field_type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  position: number;
  page?: number;
  row?: number;
}

interface UseFormStateProps {
  formId?: string;
}

export const useFormState = ({ formId }: UseFormStateProps) => {
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [extractedThemes, setExtractedThemes] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (formId) {
      fetchForm();
      fetchFields();
    } else {
      // Create new form
      setForm({
        title: 'Untitled Form',
        description: '',
        status: 'draft',
        theme_settings: {
          primaryColor: '#3b82f6',
          backgroundColor: 'transparent',
          textColor: '#1f2937',
          borderColor: '#d1d5db',
          buttonColor: '#3b82f6',
          buttonTextColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          maxWidth: 600,
          padding: 24,
          borderRadius: 8,
          cardBackground: 'transparent',
          cardShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        },
        email_settings: {},
        layout_settings: {
          type: 'single',
          columns: 1,
          rows: 1,
          columnGap: 16,
          rowGap: 16,
          breakpoints: {
            mobile: 1,
            tablet: 2,
            desktop: 3,
          },
        },
      });
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (error) throw error;
      setForm(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('position');

      if (error) throw error;
      
      // Transform database fields to component format
      const transformedFields: FormField[] = (data || []).map(field => ({
        id: field.id,
        field_type: field.field_type,
        label: field.label,
        placeholder: field.placeholder || undefined,
        required: field.required || false,
        options: field.options ? (Array.isArray(field.options) ? field.options as string[] : JSON.parse(field.options as string)) : undefined,
        position: field.position,
        page: 0, // Default to page 0 since database doesn't have page column yet
      }));
      
      setFields(transformedFields);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleThemeAdded = (newTheme: any) => {
    console.log('Adding new extracted theme:', newTheme);
    setExtractedThemes(prev => [...prev, newTheme]);
  };

  const handleRemoveExtractedTheme = (themeId: string) => {
    setExtractedThemes(prev => prev.filter(theme => theme.id !== themeId));
    toast({
      title: 'Theme Removed',
      description: 'Extracted theme has been removed from prebuilt themes',
    });
  };

  return {
    form,
    setForm,
    fields,
    setFields,
    selectedField,
    setSelectedField,
    extractedThemes,
    handleThemeAdded,
    handleRemoveExtractedTheme,
  };
};
