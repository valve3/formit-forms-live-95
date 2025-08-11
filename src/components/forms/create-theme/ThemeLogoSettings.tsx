
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemePreset } from '@/types/theme';

interface ThemeLogoSettingsProps {
  theme: ThemePreset;
  onUpdate: (key: string, value: any) => void;
}

export const ThemeLogoSettings = ({ theme, onUpdate }: ThemeLogoSettingsProps) => {
  if (!theme.logo) {
    return null;
  }

  const logoSettings = theme.logoSettings || {
    position: 'center',
    maxWidth: 200,
    maxHeight: 80,
    marginBottom: 24
  };

  const updateLogoSetting = (key: string, value: any) => {
    onUpdate('logoSettings', {
      ...logoSettings,
      [key]: value
    });
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="font-medium">Logo Settings</h3>
        
        <div>
          <Label>Position</Label>
          <Select 
            value={logoSettings.position} 
            onValueChange={(value) => updateLogoSetting('position', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Max Width: {logoSettings.maxWidth}px</Label>
          <Slider
            value={[logoSettings.maxWidth]}
            onValueChange={([value]) => updateLogoSetting('maxWidth', value)}
            min={50}
            max={400}
            step={10}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Max Height: {logoSettings.maxHeight}px</Label>
          <Slider
            value={[logoSettings.maxHeight]}
            onValueChange={([value]) => updateLogoSetting('maxHeight', value)}
            min={20}
            max={200}
            step={5}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Bottom Margin: {logoSettings.marginBottom}px</Label>
          <Slider
            value={[logoSettings.marginBottom]}
            onValueChange={([value]) => updateLogoSetting('marginBottom', value)}
            min={0}
            max={60}
            step={4}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};
