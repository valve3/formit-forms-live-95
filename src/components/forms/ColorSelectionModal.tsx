
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Check, Palette } from 'lucide-react';

interface ColorSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foundColors: string[];
  websiteUrl: string;
  onColorsSelected: (selectedColors: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    buttonColor: string;
    buttonTextColor: string;
    cardBackground: string;
  }) => void;
}

const colorRoles = [
  { key: 'primaryColor', label: 'Primary Color', description: 'Main brand/accent color' },
  { key: 'backgroundColor', label: 'Background Color', description: 'Main page background' },
  { key: 'textColor', label: 'Text Color', description: 'Primary text color' },
  { key: 'borderColor', label: 'Border Color', description: 'Borders and dividers' },
  { key: 'buttonColor', label: 'Button Color', description: 'Primary button background' },
  { key: 'buttonTextColor', label: 'Button Text Color', description: 'Text on primary buttons' },
  { key: 'cardBackground', label: 'Card Background', description: 'Content cards/sections' },
];

export const ColorSelectionModal = ({
  open,
  onOpenChange,
  foundColors,
  websiteUrl,
  onColorsSelected,
}: ColorSelectionModalProps) => {
  // Ensure foundColors is always an array
  const colorsArray = Array.isArray(foundColors) ? foundColors : [];
  
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({
    primaryColor: colorsArray[0] || '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderColor: '#d1d5db',
    buttonColor: colorsArray[0] || '#3b82f6',
    buttonTextColor: '#ffffff',
    cardBackground: '#ffffff',
  });

  // Filter out non-hex colors and invalid colors for display
  const validColors = colorsArray.filter(color => {
    return /^#[0-9A-Fa-f]{6}$/.test(color) || /^#[0-9A-Fa-f]{3}$/.test(color);
  }).slice(0, 50); // Limit to 50 colors for performance

  const handleColorSelect = (role: string, color: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [role]: color
    }));
  };

  const handleApply = () => {
    console.log('Applying colors:', selectedColors);
    onColorsSelected(selectedColors as any);
    onOpenChange(false);
  };

  const ColorPalette = ({ onColorSelect }: { onColorSelect: (color: string) => void }) => (
    <div className="grid grid-cols-8 gap-2 p-4 bg-gray-50 rounded-lg">
      {validColors.map((color, index) => (
        <button
          key={index}
          onClick={() => onColorSelect(color)}
          className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Select Colors from {websiteUrl}</span>
          </DialogTitle>
          <DialogDescription>
            Choose colors for different parts of your form from the extracted website colors.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Found Colors Section */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Found Colors ({validColors.length})
            </Label>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-12 gap-2">
                {validColors.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded border border-gray-200"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Color Roles Section */}
          <div className="space-y-6">
            {colorRoles.map((role) => (
              <div key={role.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{role.label}</Label>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: selectedColors[role.key] }}
                    />
                    <Badge variant="outline" className="font-mono text-xs">
                      {selectedColors[role.key]}
                    </Badge>
                  </div>
                </div>
                <ColorPalette onColorSelect={(color) => handleColorSelect(role.key, color)} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-between pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} className="flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span>Apply Selected Colors</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
