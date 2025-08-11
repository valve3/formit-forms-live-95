
export interface FormTheme {
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
  captcha_enabled?: boolean;
  logo?: LogoData | null;
  logoSettings?: LogoSettings;
}

export interface LogoData {
  url: string;
  name: string;
  size: number;
}

export interface LogoSettings {
  position: 'left' | 'center' | 'right';
  maxWidth: number;
  maxHeight: number;
  marginBottom: number;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: FormTheme;
  logo?: LogoData | null;
  logoSettings?: LogoSettings;
}
