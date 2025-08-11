
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ThemeSettings {
  primaryColor?: string;
  backgroundColor?: string;
  buttonColor?: string;
  textColor?: string;
}

interface FormColorSettingsProps {
  themeSettings: ThemeSettings;
  onUpdate: (key: string, value: string) => void;
}

export const FormColorSettings = ({ themeSettings, onUpdate }: FormColorSettingsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Colors</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="primaryColor">Primary Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="primaryColor"
              type="color"
              value={themeSettings.primaryColor || '#3b82f6'}
              onChange={(e) => onUpdate('primaryColor', e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={themeSettings.primaryColor || '#3b82f6'}
              onChange={(e) => onUpdate('primaryColor', e.target.value)}
              placeholder="#3b82f6"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="buttonColor">Button Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="buttonColor"
              type="color"
              value={themeSettings.buttonColor || themeSettings.primaryColor || '#3b82f6'}
              onChange={(e) => onUpdate('buttonColor', e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={themeSettings.buttonColor || themeSettings.primaryColor || '#3b82f6'}
              onChange={(e) => onUpdate('buttonColor', e.target.value)}
              placeholder="#3b82f6"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="backgroundColor">Background Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="backgroundColor"
              type="color"
              value={themeSettings.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdate('backgroundColor', e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={themeSettings.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdate('backgroundColor', e.target.value)}
              placeholder="#ffffff"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="textColor">Text Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="textColor"
              type="color"
              value={themeSettings.textColor || '#1f2937'}
              onChange={(e) => onUpdate('textColor', e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={themeSettings.textColor || '#1f2937'}
              onChange={(e) => onUpdate('textColor', e.target.value)}
              placeholder="#1f2937"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
