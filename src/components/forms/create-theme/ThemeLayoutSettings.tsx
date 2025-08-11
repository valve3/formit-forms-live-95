
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { ThemePreset } from '@/types/theme';

interface ThemeLayoutSettingsProps {
  theme: ThemePreset;
  onUpdate: (key: string, value: any) => void;
}

export const ThemeLayoutSettings = ({ theme, onUpdate }: ThemeLayoutSettingsProps) => {
  const layoutFields = [
    { key: 'maxWidth', label: 'Max Width', defaultValue: 600, min: 400, max: 1200, step: 50, unit: 'px' },
    { key: 'padding', label: 'Padding', defaultValue: 24, min: 8, max: 48, step: 4, unit: 'px' },
    { key: 'borderRadius', label: 'Border Radius', defaultValue: 8, min: 0, max: 24, step: 2, unit: 'px' },
  ];

  const getNumericValue = (key: string, defaultValue: number): number => {
    const value = theme.theme[key as keyof typeof theme.theme];
    return typeof value === 'number' ? value : defaultValue;
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="font-medium">Layout</h3>
        {layoutFields.map(({ key, label, defaultValue, min, max, step, unit }) => {
          const currentValue = getNumericValue(key, defaultValue);
          return (
            <div key={key}>
              <Label>{label}: {currentValue}{unit}</Label>
              <Slider
                value={[currentValue]}
                onValueChange={([value]) => onUpdate(key, value)}
                min={min}
                max={max}
                step={step}
                className="mt-2"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
