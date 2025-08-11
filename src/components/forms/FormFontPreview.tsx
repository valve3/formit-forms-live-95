
import { Label } from '@/components/ui/label';
import { Type } from 'lucide-react';

interface FormFontPreviewProps {
  fontFamily?: string;
}

export const FormFontPreview = ({ fontFamily }: FormFontPreviewProps) => {
  const primaryFont = fontFamily || 'Inter, sans-serif';

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Primary Font</Label>
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-gray-500" />
        <span 
          className="text-sm text-gray-700"
          style={{ fontFamily: primaryFont }}
        >
          {primaryFont.split(',')[0]} - Sample Text
        </span>
      </div>
    </div>
  );
};
