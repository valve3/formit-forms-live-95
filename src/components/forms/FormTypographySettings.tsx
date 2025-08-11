
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ThemeSettings {
  fontFamily?: string;
}

interface FormTypographySettingsProps {
  themeSettings: ThemeSettings;
  onUpdate: (key: string, value: string) => void;
}

const fontOptions = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Merriweather, serif', label: 'Merriweather' },
  { value: 'Gotham, "Helvetica Neue", Arial, sans-serif', label: 'Gotham' },
  { value: '"Averia Serif Libre", serif', label: 'Averia Serif' },
];

export const FormTypographySettings = ({ themeSettings, onUpdate }: FormTypographySettingsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Typography</h3>
      <div>
        <Label htmlFor="fontFamily">Font Family</Label>
        <Select
          value={themeSettings.fontFamily || 'Inter, sans-serif'}
          onValueChange={(value) => onUpdate('fontFamily', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
