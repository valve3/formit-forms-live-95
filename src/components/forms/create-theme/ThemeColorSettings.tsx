
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ThemePreset } from '@/types/theme';

interface ThemeColorSettingsProps {
  theme: ThemePreset;
  onUpdate: (key: string, value: any) => void;
}

export const ThemeColorSettings = ({ theme, onUpdate }: ThemeColorSettingsProps) => {
  const colorFields = [
    { key: 'primaryColor', label: 'Primary Color', defaultValue: '#3b82f6' },
    { key: 'backgroundColor', label: 'Background Color', defaultValue: '#ffffff' },
    { key: 'textColor', label: 'Text Color', defaultValue: '#000000' },
    { key: 'buttonColor', label: 'Button Color', defaultValue: '#3b82f6' },
  ];

  const getColorValue = (key: string, defaultValue: string): string => {
    const value = theme.theme[key as keyof typeof theme.theme];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="font-medium">Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          {colorFields.map(({ key, label, defaultValue }) => {
            const colorValue = getColorValue(key, defaultValue);
            return (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                <div className="flex gap-2">
                  <Input
                    id={key}
                    type="color"
                    value={colorValue}
                    onChange={(e) => onUpdate(key, e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={colorValue}
                    onChange={(e) => onUpdate(key, e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
