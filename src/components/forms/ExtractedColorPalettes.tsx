
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Palette } from 'lucide-react';

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  websiteUrl: string;
}

interface ExtractedColorPalettesProps {
  palettes: ColorPalette[];
  currentTheme: any;
  onColorSelect: (key: string, color: string) => void;
  onPaletteRemove: (paletteId: string) => void;
}

const colorRoles = [
  { key: 'primaryColor', label: 'Primary' },
  { key: 'backgroundColor', label: 'Background' },
  { key: 'textColor', label: 'Text' },
  { key: 'borderColor', label: 'Border' },
  { key: 'buttonColor', label: 'Button' },
  { key: 'buttonTextColor', label: 'Button Text' },
  { key: 'cardBackground', label: 'Card' },
];

export const ExtractedColorPalettes = ({
  palettes,
  currentTheme,
  onColorSelect,
  onPaletteRemove,
}: ExtractedColorPalettesProps) => {
  if (palettes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No Color Palettes Yet</p>
        <p className="text-sm">Extract colors from websites to create custom palettes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {palettes.map((palette) => (
        <Card key={palette.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">{palette.name}</CardTitle>
                <p className="text-xs text-gray-500 mt-1">{palette.websiteUrl}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPaletteRemove(palette.id)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Color Swatches */}
            <div className="flex flex-wrap gap-2 mb-4">
              {palette.colors.slice(0, 10).map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded border-2 border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              {palette.colors.length > 10 && (
                <div className="w-8 h-8 rounded border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                  +{palette.colors.length - 10}
                </div>
              )}
            </div>

            {/* Color Role Assignment */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Assign colors to roles:</p>
              <div className="grid grid-cols-2 gap-3">
                {colorRoles.map((role) => (
                  <div key={role.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">{role.label}</span>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: currentTheme[role.key] || '#e5e7eb' }}
                        />
                        <Badge variant="outline" className="text-xs font-mono">
                          {currentTheme[role.key] || 'Not set'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {palette.colors.slice(0, 6).map((color, index) => (
                        <button
                          key={index}
                          onClick={() => onColorSelect(role.key, color)}
                          className="w-6 h-6 rounded border border-gray-200 hover:border-gray-400 hover:scale-110 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ backgroundColor: color }}
                          title={`Set ${role.label} to ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
