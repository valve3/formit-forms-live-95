
import React from 'react';
import { sanitizeCSS, validateCSSValue } from '@/utils/security';

interface FormTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  fontFamily?: string;
  fontSize?: number;
  maxWidth?: number;
  padding?: number;
  borderRadius?: number;
  cardBackground?: string;
  cardShadow?: string;
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

interface ThemeStylesProps {
  theme?: FormTheme;
  layout?: LayoutSettings;
}

const ThemeStyles: React.FC<ThemeStylesProps> = ({ theme, layout }) => {
  const generateSecureThemeCSS = (theme: FormTheme, layout?: LayoutSettings): string => {
    if (!theme && !layout) return '';

    let css = '';

    if (theme) {
      // Sanitize all theme values
      const safeBackgroundColor = theme.backgroundColor && validateCSSValue('background-color', theme.backgroundColor) 
        ? sanitizeCSS(theme.backgroundColor) : 'transparent';
      const safeTextColor = theme.textColor && validateCSSValue('color', theme.textColor) 
        ? sanitizeCSS(theme.textColor) : '#1f2937';
      const safeFontFamily = theme.fontFamily && validateCSSValue('font-family', theme.fontFamily) 
        ? sanitizeCSS(theme.fontFamily) : 'Inter, sans-serif';
      const safeFontSize = theme.fontSize && !isNaN(theme.fontSize) && theme.fontSize > 0 && theme.fontSize <= 72 
        ? Math.floor(theme.fontSize) : 14;
      const safeMaxWidth = theme.maxWidth && !isNaN(theme.maxWidth) && theme.maxWidth > 0 && theme.maxWidth <= 2000 
        ? Math.floor(theme.maxWidth) : 600;
      const safePadding = theme.padding && !isNaN(theme.padding) && theme.padding >= 0 && theme.padding <= 100 
        ? Math.floor(theme.padding) : 24;
      const safeBorderRadius = theme.borderRadius && !isNaN(theme.borderRadius) && theme.borderRadius >= 0 && theme.borderRadius <= 50 
        ? Math.floor(theme.borderRadius) : 8;
      
      css += `
        .themed-form-container {
          background-color: ${safeBackgroundColor} !important;
          color: ${safeTextColor} !important;
          font-family: ${safeFontFamily} !important;
          font-size: ${safeFontSize}px !important;
          min-height: 100vh;
          padding: ${safePadding}px !important;
        }

        .themed-form-card {
          background-color: ${safeBackgroundColor === 'transparent' ? 'white' : safeBackgroundColor} !important;
          border-radius: ${safeBorderRadius}px !important;
          max-width: ${safeMaxWidth}px !important;
          margin: 0 auto;
          padding: ${safePadding}px !important;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1) !important;
        }

        .themed-form-input {
          border: 1px solid #d1d5db !important;
          border-radius: ${Math.round(safeBorderRadius * 0.5)}px !important;
          color: ${safeTextColor} !important;
          font-family: ${safeFontFamily} !important;
          font-size: ${safeFontSize}px !important;
          width: 100%;
          padding: 12px 16px;
          background-color: white !important;
        }

        .themed-form-button {
          background-color: #3b82f6 !important;
          color: white !important;
          border-radius: ${Math.round(safeBorderRadius * 0.5)}px !important;
          font-family: ${safeFontFamily} !important;
          font-size: ${safeFontSize}px !important;
          font-weight: 500 !important;
          padding: 12px 24px;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: opacity 0.2s;
        }

        .themed-form-label {
          color: ${safeTextColor} !important;
          font-family: ${safeFontFamily} !important;
          font-size: ${safeFontSize}px !important;
          font-weight: 500 !important;
          margin-bottom: 8px;
          display: block;
        }
      `;
    }

    return css;
  };

  const cssContent = generateSecureThemeCSS(theme || {}, layout);

  if (!cssContent) return null;

  return <style dangerouslySetInnerHTML={{ __html: cssContent }} />;
};

export default ThemeStyles;
