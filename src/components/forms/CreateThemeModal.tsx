
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeBasicInfo } from './create-theme/ThemeBasicInfo';
import { ThemeColorSettings } from './create-theme/ThemeColorSettings';
import { ThemeTypographySettings } from './create-theme/ThemeTypographySettings';
import { ThemeLayoutSettings } from './create-theme/ThemeLayoutSettings';
import { ThemeLogoSettings } from './create-theme/ThemeLogoSettings';
import { ThemePreview } from './create-theme/ThemePreview';
import { ThemePreset } from '@/types/theme';

interface CreateThemeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (theme: ThemePreset) => void;
  editingTheme?: ThemePreset | null;
}

export const CreateThemeModal = ({ open, onOpenChange, onSave, editingTheme }: CreateThemeModalProps) => {
  const [theme, setTheme] = useState<ThemePreset>(
    editingTheme || {
      id: `theme_${Date.now()}`,
      name: '',
      description: '',
      category: 'custom',
      theme: {
        primaryColor: '#3b82f6',
        backgroundColor: 'transparent',
        textColor: '#1f2937',
        borderColor: '#d1d5db',
        buttonColor: '#3b82f6',
        buttonTextColor: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        maxWidth: 600,
        padding: 24,
        borderRadius: 8,
        cardBackground: 'transparent',
        cardShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      },
      logo: null,
      logoSettings: {
        position: 'center',
        maxWidth: 200,
        maxHeight: 80,
        marginBottom: 24
      }
    }
  );

  const updateTheme = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setTheme(prev => {
        const parentObj = prev[parent as keyof ThemePreset];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setTheme(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleSave = () => {
    if (!theme.name.trim()) return;
    onSave(theme);
    onOpenChange(false);
    // Reset form
    setTheme({
      id: `theme_${Date.now()}`,
      name: '',
      description: '',
      category: 'custom',
      theme: {
        primaryColor: '#3b82f6',
        backgroundColor: 'transparent',
        textColor: '#1f2937',
        borderColor: '#d1d5db',
        buttonColor: '#3b82f6',
        buttonTextColor: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        maxWidth: 600,
        padding: 24,
        borderRadius: 8,
        cardBackground: 'transparent',
        cardShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      },
      logo: null,
      logoSettings: {
        position: 'center',
        maxWidth: 200,
        maxHeight: 80,
        marginBottom: 24
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{editingTheme ? 'Edit Theme' : 'Create New Theme'}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6 pr-4">
              <ThemeBasicInfo theme={theme} onUpdate={updateTheme} />
              <ThemeLogoSettings theme={theme} onUpdate={updateTheme} />
              <ThemeColorSettings theme={theme} onUpdate={updateTheme} />
              <ThemeTypographySettings theme={theme} onUpdate={updateTheme} />
              <ThemeLayoutSettings theme={theme} onUpdate={updateTheme} />
            </div>
          </ScrollArea>
          
          <ThemePreview theme={theme} />
        </div>
        
        <div className="flex justify-end space-x-2 p-6 pt-0 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!theme.name.trim()}>
            {editingTheme ? 'Update Theme' : 'Create Theme'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
