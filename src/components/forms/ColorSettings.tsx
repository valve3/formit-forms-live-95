
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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

interface ColorSettingsProps {
  themeSettings?: FormTheme;
  onThemeUpdate: (settings: FormTheme) => void;
}

export const ColorSettings = ({ themeSettings, onThemeUpdate }: ColorSettingsProps) => {
  const updateTheme = (key: keyof FormTheme, value: any) => {
    onThemeUpdate({ ...themeSettings, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex space-x-2">
              <Input
                id="primary-color"
                type="color"
                value={themeSettings?.primaryColor || '#3b82f6'}
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                className="w-16 h-10"
              />
              <Input
                value={themeSettings?.primaryColor || '#3b82f6'}
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                placeholder="#3b82f6"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="background-color">Background Color</Label>
            <div className="flex space-x-2">
              <Input
                id="background-color"
                type="color"
                value={themeSettings?.backgroundColor || '#ffffff'}
                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                className="w-16 h-10"
              />
              <Input
                value={themeSettings?.backgroundColor || '#ffffff'}
                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex space-x-2">
              <Input
                id="text-color"
                type="color"
                value={themeSettings?.textColor || '#1f2937'}
                onChange={(e) => updateTheme('textColor', e.target.value)}
                className="w-16 h-10"
              />
              <Input
                value={themeSettings?.textColor || '#1f2937'}
                onChange={(e) => updateTheme('textColor', e.target.value)}
                placeholder="#1f2937"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="border-color">Border Color</Label>
            <div className="flex space-x-2">
              <Input
                id="border-color"
                type="color"
                value={themeSettings?.borderColor || '#d1d5db'}
                onChange={(e) => updateTheme('borderColor', e.target.value)}
                className="w-16 h-10"
              />
              <Input
                value={themeSettings?.borderColor || '#d1d5db'}
                onChange={(e) => updateTheme('borderColor', e.target.value)}
                placeholder="#d1d5db"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="button-color">Button Color</Label>
            <div className="flex space-x-2">
              <Input
                id="button-color"
                type="color"
                value={themeSettings?.buttonColor || '#3b82f6'}
                onChange={(e) => updateTheme('buttonColor', e.target.value)}
                className="w-16 h-10"
              />
              <Input
                value={themeSettings?.buttonColor || '#3b82f6'}
                onChange={(e) => updateTheme('buttonColor', e.target.value)}
                placeholder="#3b82f6"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="button-text-color">Button Text Color</Label>
            <div className="flex space-x-2">
              <Input
                id="button-text-color"
                type="color"
                value={themeSettings?.buttonTextColor || '#ffffff'}
                onChange={(e) => updateTheme('buttonTextColor', e.target.value)}
                className="w-16 h-10"
              />
              <Input
                value={themeSettings?.buttonTextColor || '#ffffff'}
                onChange={(e) => updateTheme('buttonTextColor', e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
