
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

interface FormOperationsProps {
  formId?: string;
  form: any;
  fields: FormField[];
  setForm: (form: any) => void;
}

export const useFormOperations = ({ formId, form, fields, setForm }: FormOperationsProps) => {
  const { toast } = useToast();

  const saveForm = async () => {
    try {
      const formData = {
        ...form,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      };

      let savedForm;
      if (formId) {
        const { data, error } = await supabase
          .from('forms')
          .update(formData)
          .eq('id', formId)
          .select()
          .single();
        
        if (error) throw error;
        savedForm = data;
      } else {
        const { data, error } = await supabase
          .from('forms')
          .insert(formData)
          .select()
          .single();
        
        if (error) throw error;
        savedForm = data;
      }

      // Update form ID if it's a new form
      if (!formId && savedForm) {
        setForm(savedForm);
      }

      // Save fields
      if (savedForm) {
        // Delete existing fields
        await supabase
          .from('form_fields')
          .delete()
          .eq('form_id', savedForm.id);

        // Insert updated fields
        if (fields.length > 0) {
          const fieldsToInsert = fields.map((field, index) => ({
            form_id: savedForm.id,
            field_type: field.field_type as FieldType,
            label: field.label,
            placeholder: field.placeholder || null,
            required: field.required,
            options: field.options ? JSON.stringify(field.options) : null,
            position: index,
            page: field.page || 0,
          }));

          const { error } = await supabase
            .from('form_fields')
            .insert(fieldsToInsert);

          if (error) throw error;
        }
      }

      toast({
        title: 'Success',
        description: 'Form saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleFormStatus = async () => {
    if (!form?.id) return;
    
    const newStatus = form.status === 'published' ? 'draft' : 'published';
    
    try {
      const { error } = await supabase
        .from('forms')
        .update({ status: newStatus })
        .eq('id', form.id);

      if (error) throw error;

      setForm({ ...form, status: newStatus });
      
      toast({
        title: 'Success',
        description: `Form ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyEmbedCode = () => {
    if (!form?.id) return;
    
    const generateResponsiveEmbedCode = () => {
      const height = '600';
      const isResponsive = true;
      const heightType: 'auto' | 'viewport' | 'fixed' = 'auto';
      
      let heightStyle = '';
      let additionalStyles = '';
      
      if (isResponsive) {
        additionalStyles = `
  style="width: 100%; max-width: 100%; border: none; display: block;"`;
        
        if (heightType === 'auto') {
          heightStyle = 'height="600"';
          additionalStyles += `
  onload="this.style.height = this.contentWindow.document.body.scrollHeight + 'px';"`;
        } else if (heightType === 'viewport') {
          heightStyle = 'height="100vh"';
        } else {
          heightStyle = `height="${height}"`;
        }
      } else {
        heightStyle = `height="${height}"`;
      }

      return `<iframe 
  src="${window.location.origin}/embed/${form.id}" 
  width="100%" 
  ${heightStyle} 
  frameborder="0"
  title="${form.title}"${additionalStyles}>
</iframe>`;
    };
    
    const embedCode = generateResponsiveEmbedCode();
    navigator.clipboard.writeText(embedCode);
    toast({
      title: 'Copied!',
      description: 'Responsive embed code copied to clipboard',
    });
  };

  const previewForm = () => {
    if (!form?.id) {
      toast({
        title: 'Error',
        description: 'Please save the form first before previewing',
        variant: 'destructive',
      });
      return;
    }
    window.open(`/embed/${form.id}`, '_blank');
  };

  return {
    saveForm,
    toggleFormStatus,
    copyEmbedCode,
    previewForm,
  };
};
