
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

interface UseFieldOperationsProps {
  fields: FormField[];
  setFields: (fields: FormField[]) => void;
  setSelectedField: (fieldId: string | null) => void;
  form: any;
}

export const useFieldOperations = ({ 
  fields, 
  setFields, 
  setSelectedField, 
  form 
}: UseFieldOperationsProps) => {
  
  const addField = (fieldType: FieldType) => {
    const currentPage = form?.layout_settings?.currentPage || 0;
    
    const newField: FormField = {
      id: `field_${Date.now()}`,
      field_type: fieldType,
      label: `New ${fieldType} field`,
      placeholder: '',
      required: false,
      position: fields.filter(f => (f.page || 0) === currentPage).length,
      page: currentPage,
    };

    if (['select', 'radio', 'checkbox'].includes(fieldType)) {
      newField.options = ['Option 1', 'Option 2'];
    }

    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    setSelectedField(null);
  };

  return {
    addField,
    updateField,
    deleteField,
  };
};
