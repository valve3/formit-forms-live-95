
// Security utilities for input validation and sanitization

// CSS sanitization whitelist
const ALLOWED_CSS_PROPERTIES = [
  'color', 'background-color', 'font-family', 'font-size', 'font-weight',
  'padding', 'margin', 'border-radius', 'border-color', 'border-width',
  'max-width', 'max-height', 'width', 'height', 'opacity', 'text-align',
  'display', 'flex-direction', 'justify-content', 'align-items',
  'grid-template-columns', 'gap', 'box-shadow'
];

const ALLOWED_CSS_UNITS = ['px', 'em', 'rem', '%', 'vh', 'vw'];
const ALLOWED_COLORS = /^(#[0-9a-fA-F]{3,6}|rgb\(\d+,\s*\d+,\s*\d+\)|rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)|transparent|[a-zA-Z]+)$/;
const SAFE_FONTS = [
  'Arial', 'Helvetica', 'Times', 'Georgia', 'Verdana', 'Tahoma',
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'sans-serif', 'serif', 'monospace'
];

export const sanitizeCSS = (css: string): string => {
  // Remove potentially dangerous CSS constructs
  const dangerousPatterns = [
    /javascript:/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
    /@import/gi,
    /behavior\s*:/gi,
    /-moz-binding/gi,
    /position\s*:\s*fixed/gi,
    /position\s*:\s*absolute/gi,
  ];

  let sanitized = css;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
};

export const validateCSSValue = (property: string, value: string): boolean => {
  if (!ALLOWED_CSS_PROPERTIES.includes(property)) {
    return false;
  }

  // Validate color values
  if (property.includes('color') || property === 'border-color') {
    return ALLOWED_COLORS.test(value);
  }

  // Validate font families
  if (property === 'font-family') {
    const fonts = value.split(',').map(f => f.trim().replace(/['"]/g, ''));
    return fonts.every(font => SAFE_FONTS.includes(font));
  }

  // Validate numeric values with units
  if (property.includes('size') || property.includes('width') || property.includes('height') || 
      property.includes('padding') || property.includes('margin') || property.includes('radius')) {
    const numericPattern = new RegExp(`^\\d+(\\.\\d+)?(${ALLOWED_CSS_UNITS.join('|')})$`);
    return numericPattern.test(value) || value === 'auto' || value === 'none';
  }

  return true;
};

export const sanitizeEmail = (email: string): string => {
  // Remove potentially dangerous characters while preserving valid email structure
  return email.replace(/[<>'"\\]/g, '').trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and dangerous characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove dangerous characters
    .trim();
};

export const validateFormData = (data: Record<string, any>, fields: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  fields.forEach(field => {
    const value = data[field.id];
    
    // Check required fields
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(`${field.label} is required`);
      return;
    }
    
    if (value) {
      // Validate email fields
      if (field.field_type === 'email') {
        if (!validateEmail(value)) {
          errors.push(`${field.label} must be a valid email address`);
        }
      }
      
      // Validate text length
      if (typeof value === 'string' && value.length > 10000) {
        errors.push(`${field.label} is too long (maximum 10,000 characters)`);
      }
      
      // Validate URLs
      if (field.field_type === 'url') {
        try {
          new URL(value);
        } catch {
          errors.push(`${field.label} must be a valid URL`);
        }
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

export const validateOrigin = (origin: string, allowedOrigins: string[]): boolean => {
  return allowedOrigins.includes(origin);
};
