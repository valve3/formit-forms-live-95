
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Trash2, Edit } from 'lucide-react';
import { FormTheme, ThemePreset } from '@/types/theme';

interface ThemeCardProps {
  preset: ThemePreset;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onRemove?: () => void;
}

export const ThemeCard = ({ preset, isSelected, onSelect, onEdit, onRemove }: ThemeCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{preset.name}</h4>
            <p className="text-xs text-gray-600 mt-1">{preset.description}</p>
          </div>
          <div className="flex items-center space-x-1">
            {isSelected && (
              <Check className="h-4 w-4 text-blue-500" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-6 w-6 p-0 text-gray-600 hover:text-blue-600"
              title="Edit theme"
            >
              <Edit className="h-3 w-3" />
            </Button>
            {preset.category === 'Saved' && onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                title="Remove theme"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {preset.category}
          </Badge>
          
          {/* Color Preview */}
          <div className="flex space-x-1">
            <div 
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: preset.theme.primaryColor }}
            />
            <div 
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: preset.theme.backgroundColor }}
            />
            <div 
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: preset.theme.buttonColor }}
            />
          </div>
        </div>

        {/* Mini Preview */}
        <div 
          className="mt-3 p-2 rounded text-xs border"
          style={{
            backgroundColor: preset.theme.cardBackground,
            color: preset.theme.textColor,
            borderColor: preset.theme.borderColor,
            fontFamily: preset.theme.fontFamily,
            fontSize: `${Math.max(10, (preset.theme.fontSize || 14) - 2)}px`,
          }}
        >
          <div className="mb-1 font-medium">Sample Form</div>
          <div 
            className="w-full h-4 rounded mb-1"
            style={{ backgroundColor: preset.theme.backgroundColor }}
          />
          <div 
            className="w-16 h-3 rounded text-center leading-3"
            style={{ 
              backgroundColor: preset.theme.buttonColor,
              color: preset.theme.buttonTextColor,
            }}
          >
            Submit
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
