
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Save, X } from 'lucide-react';
import { FormTheme, ThemePreset } from '@/types/theme';

interface ThemeEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: ThemePreset | null;
  onSave: (editedTheme: ThemePreset) => void;
}

const fontOptions = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Gotham, "Helvetica Neue", Arial, sans-serif', label: 'Gotham' },
  { value: '"Averia Serif Libre", serif', label: 'Averia Serif' },
];

const categories = ['Business', 'Creative', 'Health', 'Design'];

export const ThemeEditModal = ({ open, onOpenChange, theme, onSave }: ThemeEditModalProps) => {
  const [editedTheme, setEditedTheme] = useState<ThemePreset | null>(theme);

  const updateTheme = (key: string, value: any) => {
    if (!editedTheme) return;
    
    if (key === 'name' || key === 'description' || key === 'category') {
      setEditedTheme({
        ...editedTheme,
        [key]: value,
      });
    } else {
      setEditedTheme({
        ...editedTheme,
        theme: {
          ...editedTheme.theme,
          [key]: value,
        },
      });
    }
  };

  const handleSave = () => {
    if (editedTheme) {
      onSave(editedTheme);
      onOpenChange(false);
    }
  };

  if (!editedTheme) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Theme: {editedTheme.name}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-[70vh]">
          {/* Settings Panel */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-4">
            {/* Basic Info */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">Theme Information</h3>
                <div>
                  <Label htmlFor="theme-name">Name</Label>
                  <Input
                    id="theme-name"
                    value={editedTheme.name}
                    onChange={(e) => updateTheme('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="theme-description">Description</Label>
                  <Input
                    id="theme-description"
                    value={editedTheme.description}
                    onChange={(e) => updateTheme('description', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="theme-category">Category</Label>
                  <Select
                    value={editedTheme.category}
                    onValueChange={(value) => updateTheme('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={editedTheme.theme.primaryColor || '#3b82f6'}
                        onChange={(e) => updateTheme('primaryColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={editedTheme.theme.primaryColor || '#3b82f6'}
                        onChange={(e) => updateTheme('primaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bg-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bg-color"
                        type="color"
                        value={editedTheme.theme.backgroundColor || '#ffffff'}
                        onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={editedTheme.theme.backgroundColor || '#ffffff'}
                        onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text-color"
                        type="color"
                        value={editedTheme.theme.textColor || '#000000'}
                        onChange={(e) => updateTheme('textColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={editedTheme.theme.textColor || '#000000'}
                        onChange={(e) => updateTheme('textColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="button-color">Button Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="button-color"
                        type="color"
                        value={editedTheme.theme.buttonColor || '#3b82f6'}
                        onChange={(e) => updateTheme('buttonColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={editedTheme.theme.buttonColor || '#3b82f6'}
                        onChange={(e) => updateTheme('buttonColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">Typography</h3>
                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select
                    value={editedTheme.theme.fontFamily || 'Inter, sans-serif'}
                    onValueChange={(value) => updateTheme('fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Font Size: {editedTheme.theme.fontSize || 14}px</Label>
                  <Slider
                    value={[editedTheme.theme.fontSize || 14]}
                    onValueChange={([value]) => updateTheme('fontSize', value)}
                    min={10}
                    max={24}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Layout */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">Layout</h3>
                <div>
                  <Label>Max Width: {editedTheme.theme.maxWidth || 600}px</Label>
                  <Slider
                    value={[editedTheme.theme.maxWidth || 600]}
                    onValueChange={([value]) => updateTheme('maxWidth', value)}
                    min={400}
                    max={1200}
                    step={50}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Padding: {editedTheme.theme.padding || 24}px</Label>
                  <Slider
                    value={[editedTheme.theme.padding || 24]}
                    onValueChange={([value]) => updateTheme('padding', value)}
                    min={8}
                    max={48}
                    step={4}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Border Radius: {editedTheme.theme.borderRadius || 8}px</Label>
                  <Slider
                    value={[editedTheme.theme.borderRadius || 8]}
                    onValueChange={([value]) => updateTheme('borderRadius', value)}
                    min={0}
                    max={24}
                    step={2}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="w-80 border-l pl-6">
            <h3 className="font-medium mb-4">Preview</h3>
            <div
              className="p-4 rounded border"
              style={{
                backgroundColor: editedTheme.theme.backgroundColor,
                maxWidth: `${Math.min(editedTheme.theme.maxWidth || 600, 300)}px`,
                fontFamily: editedTheme.theme.fontFamily,
                fontSize: `${(editedTheme.theme.fontSize || 14) - 2}px`,
              }}
            >
              <div
                className="mb-3 font-medium"
                style={{ color: editedTheme.theme.textColor }}
              >
                {editedTheme.name}
              </div>
              <div
                className="w-full h-8 mb-3 rounded border"
                style={{
                  backgroundColor: editedTheme.theme.cardBackground || '#ffffff',
                  borderColor: editedTheme.theme.borderColor,
                  borderRadius: `${Math.max(4, (editedTheme.theme.borderRadius || 8) - 2)}px`,
                }}
              />
              <button
                className="px-4 py-2 rounded font-medium"
                style={{
                  backgroundColor: editedTheme.theme.buttonColor,
                  color: editedTheme.theme.buttonTextColor,
                  borderRadius: `${Math.max(4, (editedTheme.theme.borderRadius || 8) - 2)}px`,
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
