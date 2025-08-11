
import { useState, useEffect } from 'react';

interface ConditionalRule {
  fieldId: string;
  condition: 'filled' | 'equals' | 'contains' | 'email_valid';
  value?: string;
  action: 'show_submit' | 'show_field' | 'hide_field';
  targetId?: string;
}

interface UseConditionalLogicProps {
  formData: Record<string, any>;
  fields: Array<{ id: string; field_type: string; required: boolean }>;
  rules?: ConditionalRule[];
}

export const useConditionalLogic = ({ formData, fields, rules = [] }: UseConditionalLogicProps) => {
  const [canSubmit, setCanSubmit] = useState(false);
  const [visibleFields, setVisibleFields] = useState<string[]>([]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFieldValueValid = (field: { id: string; field_type: string; required: boolean }): boolean => {
    const value = formData[field.id];
    
    // If field is not required and empty, it's valid
    if (!field.required && (!value || value === '')) {
      return true;
    }
    
    // If field is required, it must have a value
    if (field.required && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
      return false;
    }
    
    // Special validation for email fields
    if (field.field_type === 'email' && value) {
      return isValidEmail(value);
    }
    
    // For checkbox fields, check if array has values
    if (field.field_type === 'checkbox' && Array.isArray(value)) {
      return field.required ? value.length > 0 : true;
    }
    
    return true;
  };

  const evaluateCondition = (rule: ConditionalRule): boolean => {
    const fieldValue = formData[rule.fieldId];
    
    switch (rule.condition) {
      case 'filled':
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
      case 'equals':
        return fieldValue === rule.value;
      case 'contains':
        return fieldValue && fieldValue.toString().includes(rule.value || '');
      case 'email_valid':
        return fieldValue && isValidEmail(fieldValue);
      default:
        return false;
    }
  };

  useEffect(() => {
    console.log('Validating form fields:', fields);
    console.log('Current form data:', formData);
    
    // Check all fields are valid
    const allFieldsValid = fields.every(field => {
      const isValid = isFieldValueValid(field);
      console.log(`Field ${field.id} (${field.field_type}, required: ${field.required}):`, isValid, 'Value:', formData[field.id]);
      return isValid;
    });

    // Evaluate custom rules for submission
    const submitRules = rules.filter(rule => rule.action === 'show_submit');
    const customSubmitConditions = submitRules.length === 0 || submitRules.some(rule => evaluateCondition(rule));

    const canSubmitForm = allFieldsValid && customSubmitConditions;
    console.log('Can submit form:', canSubmitForm, 'All fields valid:', allFieldsValid, 'Custom conditions:', customSubmitConditions);
    
    setCanSubmit(canSubmitForm);

    // Handle field visibility
    const allFieldIds = fields.map(field => field.id);
    const hideRules = rules.filter(rule => rule.action === 'hide_field');
    const showRules = rules.filter(rule => rule.action === 'show_field');

    let visible = [...allFieldIds];

    hideRules.forEach(rule => {
      if (evaluateCondition(rule) && rule.targetId) {
        visible = visible.filter(id => id !== rule.targetId);
      }
    });

    showRules.forEach(rule => {
      if (evaluateCondition(rule) && rule.targetId && !visible.includes(rule.targetId)) {
        visible.push(rule.targetId);
      }
    });

    setVisibleFields(visible);
  }, [formData, fields, rules]);

  return {
    canSubmit,
    visibleFields,
    isValidEmail
  };
};
