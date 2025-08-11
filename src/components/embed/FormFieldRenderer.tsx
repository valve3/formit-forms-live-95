
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sanitizeInput } from '@/utils/security';

interface FormField {
  id: string;
  field_type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  position: number;
}

interface FormFieldRendererProps {
  field: FormField;
  value: any;
  onChange: (fieldId: string, value: any) => void;
  validationState?: 'normal' | 'valid' | 'invalid';
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  field,
  value,
  onChange,
  validationState = 'normal'
}) => {
  const updateFormData = (fieldId: string, newValue: any) => {
    // For textarea fields, don't sanitize during input to preserve user's spaces
    // Sanitization will happen during form submission
    onChange(fieldId, newValue);
  };

  const commonProps = {
    placeholder: field.placeholder,
    required: field.required,
    value: value || '',
    className: 'themed-form-input',
  };

  const renderField = () => {
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
        return (
          <Input
            type={field.field_type}
            {...commonProps}
            onChange={(e) => updateFormData(field.id, e.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            {...commonProps}
            onChange={(e) => updateFormData(field.id, e.target.value)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            className="themed-form-input"
            onChange={(e) => updateFormData(field.id, e.target.value)}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            {...commonProps}
            onChange={(e) => updateFormData(field.id, e.target.value)}
          />
        );
      case 'file':
        return (
          <Input
            type="file"
            required={field.required}
            className="themed-form-input"
            onChange={(e) => updateFormData(field.id, e.target.files?.[0])}
          />
        );
      case 'select':
        return (
          <Select onValueChange={(value) => updateFormData(field.id, value)}>
            <SelectTrigger className="themed-form-input themed-form-select">
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  id={`${field.id}_${index}`}
                  value={option}
                  onChange={(e) => updateFormData(field.id, e.target.value)}
                />
                <label htmlFor={`${field.id}_${index}`} className="themed-form-label">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${field.id}_${index}`}
                  value={option}
                  onChange={(e) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      updateFormData(field.id, [...currentValues, option]);
                    } else {
                      updateFormData(field.id, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                />
                <label htmlFor={`${field.id}_${index}`} className="themed-form-label">{option}</label>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <Input
            {...commonProps}
            onChange={(e) => updateFormData(field.id, e.target.value)}
          />
        );
    }
  };

  const renderWithValidation = () => {
    const baseField = renderField();
    
    if (field.field_type === 'email') {
      return (
        <div>
          <div className={`${
            validationState === 'invalid' ? '[&_input]:border-red-500 [&_input]:focus:border-red-500' :
            validationState === 'valid' ? '[&_input]:border-green-500 [&_input]:focus:border-green-500' : ''
          }`}>
            {baseField}
          </div>
          {validationState === 'invalid' && (
            <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
          )}
          {validationState === 'valid' && (
            <p className="text-green-500 text-sm mt-1">Valid email address ✓</p>
          )}
        </div>
      );
    }
    
    return baseField;
  };

  return (
    <div>
      <label className="themed-form-label">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderWithValidation()}
    </div>
  );
};

export default FormFieldRenderer;
