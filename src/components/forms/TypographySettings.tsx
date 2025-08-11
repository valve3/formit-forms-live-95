
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

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

interface TypographySettingsProps {
  themeSettings?: FormTheme;
  onThemeUpdate: (settings: FormTheme) => void;
}

const fontOptions = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Gotham, "Helvetica Neue", Arial, sans-serif', label: 'Gotham' },
  { value: '"Averia Serif Libre", serif', label: 'Averia Serif' },
];

export const TypographySettings = ({ themeSettings, onThemeUpdate }: TypographySettingsProps) => {
  const updateTheme = (key: keyof FormTheme, value: any) => {
    onThemeUpdate({ ...themeSettings, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Typography Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="font-family">Font Family</Label>
          <Select
            value={themeSettings?.fontFamily || 'Inter, sans-serif'}
            onValueChange={(value) => updateTheme('fontFamily', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Font Size: {themeSettings?.fontSize || 14}px</Label>
          <Slider
            value={[themeSettings?.fontSize || 14]}
            onValueChange={([value]) => updateTheme('fontSize', value)}
            min={10}
            max={24}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Max Width: {themeSettings?.maxWidth || 600}px</Label>
          <Slider
            value={[themeSettings?.maxWidth || 600]}
            onValueChange={([value]) => updateTheme('maxWidth', value)}
            min={400}
            max={1200}
            step={50}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Padding: {themeSettings?.padding || 24}px</Label>
          <Slider
            value={[themeSettings?.padding || 24]}
            onValueChange={([value]) => updateTheme('padding', value)}
            min={8}
            max={48}
            step={4}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Border Radius: {themeSettings?.borderRadius || 8}px</Label>
          <Slider
            value={[themeSettings?.borderRadius || 8]}
            onValueChange={([value]) => updateTheme('borderRadius', value)}
            min={0}
            max={24}
            step={2}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};
