
import { Label } from '@/components/ui/label';

interface FormColorPreviewProps {
  themeSettings?: {
    primaryColor?: string;
    backgroundColor?: string;
    buttonColor?: string;
    borderColor?: string;
    cardBackground?: string;
  };
}

export const FormColorPreview = ({ themeSettings }: FormColorPreviewProps) => {
  if (!themeSettings) return null;

  const getFormColors = () => {
    const colors = [];
    if (themeSettings.primaryColor) colors.push({ color: themeSettings.primaryColor, label: 'Primary' });
    if (themeSettings.buttonColor && themeSettings.buttonColor !== themeSettings.primaryColor) colors.push({ color: themeSettings.buttonColor, label: 'Button' });
    if (themeSettings.backgroundColor && themeSettings.backgroundColor !== 'transparent') colors.push({ color: themeSettings.backgroundColor, label: 'Background' });
    if (themeSettings.cardBackground && themeSettings.cardBackground !== 'transparent' && themeSettings.cardBackground !== themeSettings.backgroundColor) colors.push({ color: themeSettings.cardBackground, label: 'Card' });
    
    return colors.slice(0, 4);
  };

  const formColors = getFormColors();

  if (formColors.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Form Colors</Label>
      <div className="flex flex-wrap gap-2">
        {formColors.map((colorInfo, index) => (
          <div key={index} className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded border border-gray-200"
              style={{ backgroundColor: colorInfo.color }}
              title={`${colorInfo.label}: ${colorInfo.color}`}
            />
            <span className="text-xs text-gray-500">{colorInfo.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
