
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { ThemePreset } from '@/types/theme';

interface ThemeBasicInfoProps {
  theme: ThemePreset;
  onUpdate: (key: string, value: any) => void;
}

export const ThemeBasicInfo = ({ theme, onUpdate }: ThemeBasicInfoProps) => {
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = {
          url: e.target?.result as string,
          name: file.name,
          size: file.size
        };
        onUpdate('logo', logoData);
        // Clear the input so the same file can be uploaded again
        event.target.value = '';
      };
      reader.onerror = () => {
        console.error('Error reading file');
        event.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    onUpdate('logo', null);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="font-medium">Theme Information</h3>
        <div>
          <Label htmlFor="theme-name">Name *</Label>
          <Input
            id="theme-name"
            value={theme.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Enter theme name"
          />
        </div>
        <div>
          <Label htmlFor="theme-description">Description</Label>
          <Input
            id="theme-description"
            value={theme.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Enter theme description"
          />
        </div>
        <div>
          <Label htmlFor="theme-logo">Logo (optional)</Label>
          {theme.logo ? (
            <div className="mt-2">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <img 
                    src={theme.logo.url} 
                    alt="Logo preview" 
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-sm text-gray-600">{theme.logo.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeLogo}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload logo</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG up to 2MB</p>
                  </div>
                </div>
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
