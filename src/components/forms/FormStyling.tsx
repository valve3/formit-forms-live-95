
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebsiteThemeExtractor } from './WebsiteThemeExtractor';
import { FormThemes } from './FormThemes';
import { ColorSettings } from './ColorSettings';
import { TypographySettings } from './TypographySettings';
import { FormLayout } from './FormLayout';
import { Settings, Palette, Globe, Layout } from 'lucide-react';
import { FormTheme } from '@/types/theme';

interface PageSettings {
  id: string;
  title: string;
  columns: number;
  columnGap: number;
  rowGap: number;
}

interface LayoutSettings {
  type: 'single' | 'grid';
  columns: number;
  rows: number;
  columnGap: number;
  rowGap: number;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  pages: PageSettings[];
  currentPage: number;
}

interface FormStylingProps {
  themeSettings?: FormTheme;
  layoutSettings?: LayoutSettings;
  onThemeUpdate: (settings: FormTheme) => void;
  onLayoutUpdate: (settings: LayoutSettings) => void;
  extractedThemes?: any[];
  onThemeAdded?: (theme: any) => void;
  onRemoveExtractedTheme?: (themeId: string) => void;
}

export const FormStyling = ({ 
  themeSettings, 
  layoutSettings, 
  onThemeUpdate, 
  onLayoutUpdate,
  extractedThemes = [],
  onThemeAdded,
  onRemoveExtractedTheme
}: FormStylingProps) => {
  return (
    <Tabs defaultValue="presets" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="presets" className="flex items-center space-x-2">
          <Palette className="h-4 w-4" />
          <span>Themes</span>
        </TabsTrigger>
        <TabsTrigger value="layout" className="flex items-center space-x-2">
          <Layout className="h-4 w-4" />
          <span>Layout</span>
        </TabsTrigger>
        <TabsTrigger value="colors" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Colors</span>
        </TabsTrigger>
        <TabsTrigger value="typography" className="flex items-center space-x-2">
          <span>Typography</span>
        </TabsTrigger>
        <TabsTrigger value="extract" className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span>Extract</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="presets">
        <FormThemes
          currentTheme={themeSettings}
          onThemeSelect={onThemeUpdate}
          extractedThemes={extractedThemes}
          onRemoveExtractedTheme={onRemoveExtractedTheme}
        />
      </TabsContent>

      <TabsContent value="layout" className="space-y-6">
        <FormLayout
          layoutSettings={layoutSettings}
          onUpdate={onLayoutUpdate}
        />
      </TabsContent>

      <TabsContent value="colors" className="space-y-6">
        <ColorSettings
          themeSettings={themeSettings}
          onThemeUpdate={onThemeUpdate}
        />
      </TabsContent>

      <TabsContent value="typography" className="space-y-6">
        <TypographySettings
          themeSettings={themeSettings}
          onThemeUpdate={onThemeUpdate}
        />
      </TabsContent>

      <TabsContent value="extract">
        <WebsiteThemeExtractor
          onThemeExtracted={onThemeUpdate}
          formTitle="Form Theme"
          onThemeAdded={onThemeAdded}
        />
      </TabsContent>
    </Tabs>
  );
};
