
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFormOperations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteForm = async (formId: string, onSuccess?: () => void) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Form deleted successfully',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const duplicateForm = async (formId: string, onSuccess?: () => void) => {
    setLoading(true);
    try {
      // Get the original form
      const { data: originalForm, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) throw formError;

      // Get the form fields
      const { data: originalFields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('position');

      if (fieldsError) throw fieldsError;

      // Create the new form
      const { data: newForm, error: newFormError } = await supabase
        .from('forms')
        .insert({
          title: `${originalForm.title} (Copy)`,
          description: originalForm.description,
          status: 'draft',
          theme_settings: originalForm.theme_settings,
          email_settings: originalForm.email_settings,
          layout_settings: originalForm.layout_settings,
          user_id: originalForm.user_id,
        })
        .select()
        .single();

      if (newFormError) throw newFormError;

      // Create the form fields for the new form
      if (originalFields && originalFields.length > 0) {
        const newFields = originalFields.map(field => ({
          form_id: newForm.id,
          field_type: field.field_type,
          label: field.label,
          placeholder: field.placeholder,
          required: field.required,
          options: field.options,
          validation_rules: field.validation_rules,
          position: field.position,
        }));

        const { error: fieldsInsertError } = await supabase
          .from('form_fields')
          .insert(newFields);

        if (fieldsInsertError) throw fieldsInsertError;
      }

      toast({
        title: 'Success',
        description: 'Form duplicated successfully',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFormStatus = async (formId: string, currentStatus: string, onSuccess?: () => void) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('forms')
        .update({ status: newStatus })
        .eq('id', formId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Form ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteForm,
    duplicateForm,
    toggleFormStatus,
    loading
  };
};
