
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WebsiteThemeExtractor } from './WebsiteThemeExtractor';
import { Separator } from '@/components/ui/separator';
import { FormEmailSettings } from './FormEmailSettings';
import { FormColorSettings } from './FormColorSettings';
import { FormTypographySettings } from './FormTypographySettings';
import { FormStylePreview } from './FormStylePreview';
import { ExtractedColorPalettes } from './ExtractedColorPalettes';
import { Palette, Settings } from 'lucide-react';

interface Form {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  embed_code: string;
  theme_settings?: {
    primaryColor?: string;
    backgroundColor?: string;
    buttonColor?: string;
    borderColor?: string;
    cardBackground?: string;
    fontFamily?: string;
    textColor?: string;
  };
  email_settings?: {
    enabled?: boolean;
    emails?: string[];
  };
  extracted_palettes?: Array<{
    id: string;
    name: string;
    colors: string[];
    websiteUrl: string;
  }>;
}

interface FormStyleEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: Form;
  onSave: () => void;
}

export const FormStyleEditor = ({ open, onOpenChange, form, onSave }: FormStyleEditorProps) => {
  const [themeSettings, setThemeSettings] = useState(form.theme_settings || {});
  const [emailSettings, setEmailSettings] = useState(form.email_settings || { enabled: false, emails: [''] });
  const [extractedPalettes, setExtractedPalettes] = useState(form.extracted_palettes || []);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateSetting = (key: string, value: string) => {
    setThemeSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExtractedTheme = (extractedTheme: any) => {
    console.log('Applying extracted theme:', extractedTheme);
    setThemeSettings(prev => ({
      ...prev,
      ...extractedTheme
    }));
    toast({
      title: 'Theme Applied',
      description: 'Website theme has been applied to your form',
    });
  };

  const handlePaletteAdded = (palette: { id: string; name: string; colors: string[]; websiteUrl: string }) => {
    setExtractedPalettes(prev => [...prev, palette]);
    toast({
      title: 'Palette Added',
      description: `Color palette from ${palette.name} has been saved`,
    });
  };

  const handlePaletteRemoved = (paletteId: string) => {
    setExtractedPalettes(prev => prev.filter(p => p.id !== paletteId));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('forms')
        .update({ 
          theme_settings: themeSettings,
          email_settings: emailSettings,
          extracted_palettes: extractedPalettes
        })
        .eq('id', form.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Form style and email settings updated successfully',
      });

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Form Style - {form.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Website Theme Extractor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Extract Website Theme</h3>
            <WebsiteThemeExtractor
              onThemeExtracted={handleExtractedTheme}
              compact={true}
              formTitle={form.title}
              onPaletteAdded={handlePaletteAdded}
            />
          </div>

          <Separator />

          {/* Email Settings Section */}
          <FormEmailSettings
            emailSettings={emailSettings}
            onUpdate={setEmailSettings}
          />

          <Separator />

          {/* Colors Section with Tabs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Colors</h3>
            <Tabs defaultValue="palettes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="palettes" className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Color Palettes</span>
                </TabsTrigger>
                <TabsTrigger value="picker" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Color Picker</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="palettes" className="mt-4">
                <ExtractedColorPalettes
                  palettes={extractedPalettes}
                  currentTheme={themeSettings}
                  onColorSelect={updateSetting}
                  onPaletteRemove={handlePaletteRemoved}
                />
              </TabsContent>
              
              <TabsContent value="picker" className="mt-4">
                <FormColorSettings
                  themeSettings={themeSettings}
                  onUpdate={updateSetting}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Typography Section */}
          <FormTypographySettings
            themeSettings={themeSettings}
            onUpdate={updateSetting}
          />

          {/* Preview Section */}
          <FormStylePreview themeSettings={themeSettings} />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
