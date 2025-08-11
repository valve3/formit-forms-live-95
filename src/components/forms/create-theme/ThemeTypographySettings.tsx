
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { ThemePreset } from '@/types/theme';

interface ThemeTypographySettingsProps {
  theme: ThemePreset;
  onUpdate: (key: string, value: any) => void;
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

export const ThemeTypographySettings = ({ theme, onUpdate }: ThemeTypographySettingsProps) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="font-medium">Typography</h3>
        <div>
          <Label htmlFor="font-family">Font Family</Label>
          <Select
            value={theme.theme.fontFamily || 'Inter, sans-serif'}
            onValueChange={(value) => onUpdate('fontFamily', value)}
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
          <Label>Font Size: {theme.theme.fontSize || 14}px</Label>
          <Slider
            value={[theme.theme.fontSize || 14]}
            onValueChange={([value]) => onUpdate('fontSize', value)}
            min={10}
            max={24}
            step={1}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};
