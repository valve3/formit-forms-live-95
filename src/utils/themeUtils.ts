
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
  pages: Array<{
    id: string;
    title: string;
    columns: number;
    rows: Array<{
      id: string;
      columns: number;
      fields: string[];
    }>;
  }>;
  currentPage: number;
}

export const generateThemeCSS = (theme: FormTheme, layout?: LayoutSettings): string => {
  if (!theme && !layout) return '';

  let css = '';

  if (theme) {
    // Handle transparent backgrounds properly
    const backgroundColor = !theme.backgroundColor || theme.backgroundColor === 'transparent' ? 'transparent' : theme.backgroundColor;
    const cardBackground = !theme.cardBackground || theme.cardBackground === 'transparent' ? 'transparent' : theme.cardBackground;
    
    css += `
      .preview-form-container {
        background-color: ${backgroundColor} !important;
        color: ${theme.textColor || '#1f2937'} !important;
        font-family: ${theme.fontFamily || 'Inter, sans-serif'} !important;
        font-size: ${theme.fontSize || 14}px !important;
        padding: ${theme.padding || 24}px !important;
      }

      .preview-form-card {
        background-color: ${cardBackground} !important;
        box-shadow: ${cardBackground === 'transparent' ? 'none' : (theme.cardShadow || '0 1px 3px 0 rgb(0 0 0 / 0.1)')} !important;
        border-radius: ${theme.borderRadius || 8}px !important;
        max-width: ${theme.maxWidth || 600}px !important;
        margin: 0 auto;
        padding: ${theme.padding || 24}px !important;
      }

      .preview-form-input {
        border-color: ${theme.borderColor || '#d1d5db'} !important;
        border-radius: ${Math.round((theme.borderRadius || 8) * 0.5)}px !important;
        color: ${theme.textColor || '#1f2937'} !important;
        font-family: ${theme.fontFamily || 'Inter, sans-serif'} !important;
        font-size: ${theme.fontSize || 14}px !important;
        background-color: ${cardBackground === 'transparent' ? 'rgba(255, 255, 255, 0.1)' : cardBackground} !important;
      }

      .preview-form-input:focus {
        border-color: ${theme.primaryColor || '#3b82f6'} !important;
        box-shadow: 0 0 0 2px ${theme.primaryColor || '#3b82f6'}20 !important;
      }

      .preview-form-button {
        background-color: ${theme.buttonColor || '#3b82f6'} !important;
        color: ${theme.buttonTextColor || '#ffffff'} !important;
        border-radius: ${Math.round((theme.borderRadius || 8) * 0.5)}px !important;
        font-family: ${theme.fontFamily || 'Inter, sans-serif'} !important;
        font-size: ${theme.fontSize || 14}px !important;
      }

      .preview-form-label {
        color: ${theme.textColor || '#1f2937'} !important;
        font-family: ${theme.fontFamily || 'Inter, sans-serif'} !important;
        font-size: ${theme.fontSize || 14}px !important;
      }

      .preview-form-title {
        color: ${theme.textColor || '#1f2937'} !important;
        font-family: ${theme.fontFamily || 'Inter, sans-serif'} !important;
        font-size: ${Math.round((theme.fontSize || 14) * 1.75)}px !important;
      }

      .preview-form-description {
        color: ${theme.textColor || '#1f2937'} !important;
        font-family: ${theme.fontFamily || 'Inter, sans-serif'} !important;
        font-size: ${theme.fontSize || 14}px !important;
      }

      [data-radix-select-trigger].preview-form-input {
        border-color: ${theme.borderColor || '#d1d5db'} !important;
        color: ${theme.textColor || '#1f2937'} !important;
        font-family: ${theme.fontFamily || 'Inter, sans-serif'} !important;
        font-size: ${theme.fontSize || 14}px !important;
        background-color: ${cardBackground === 'transparent' ? 'rgba(255, 255, 255, 0.1)' : cardBackground} !important;
      }
    `;
  }

  if (layout && layout.type === 'grid') {
    css += `
      .preview-form-grid-layout {
        display: grid;
        grid-template-columns: repeat(${layout.columns}, 1fr);
        gap: ${layout.rowGap}px ${layout.columnGap}px;
      }
      
      @media (max-width: 768px) {
        .preview-form-grid-layout {
          grid-template-columns: repeat(${layout.breakpoints?.mobile || 1}, 1fr);
        }
      }
      
      @media (min-width: 769px) and (max-width: 1024px) {
        .preview-form-grid-layout {
          grid-template-columns: repeat(${layout.breakpoints?.tablet || 2}, 1fr);
        }
      }
      
      @media (min-width: 1025px) {
        .preview-form-grid-layout {
          grid-template-columns: repeat(${layout.breakpoints?.desktop || layout.columns}, 1fr);
        }
      }
      
      .preview-form-submit-button {
        grid-column: 1 / -1;
      }
    `;
  }

  return css;
};
