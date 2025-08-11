
import { useState } from 'react';
import { FormStyling } from '@/components/forms/FormStyling';
import { WebsiteThemeExtractor } from '@/components/forms/WebsiteThemeExtractor';
import { FormTheme } from '@/types/theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

interface ThemesPageProps {
  extractedThemes: any[];
  onThemeAdded: (theme: any) => void;
  onRemoveExtractedTheme: (themeId: string) => void;
}

export const ThemesPage = ({
  extractedThemes,
  onThemeAdded,
  onRemoveExtractedTheme,
}: ThemesPageProps) => {
  const [currentTheme, setCurrentTheme] = useState<FormTheme>({});
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    type: 'single',
    columns: 1,
    rows: 1,
    columnGap: 16,
    rowGap: 16,
    breakpoints: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
    },
    pages: [
      {
        id: 'page_1',
        title: 'Page 1',
        columns: 1,
        columnGap: 16,
        rowGap: 16,
      }
    ],
    currentPage: 0,
  });

  const handleThemeExtracted = (theme: any) => {
    onThemeAdded(theme);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Themes</h1>
        <p className="mt-2 text-gray-600">
          Manage and customize your form themes. Choose from pre-built themes, extract themes from websites, or create your own custom styling.
        </p>
      </div>

      {/* Website Theme Extraction Tool */}
      <Card>
        <CardHeader>
          <CardTitle>Extract Website Theme</CardTitle>
          <CardDescription>
            Extract colors and styling from any website to create a custom theme for your forms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebsiteThemeExtractor 
            onThemeExtracted={handleThemeExtracted}
            compact={false}
          />
        </CardContent>
      </Card>

      <FormStyling
        themeSettings={currentTheme}
        layoutSettings={layoutSettings}
        onThemeUpdate={setCurrentTheme}
        onLayoutUpdate={setLayoutSettings}
        extractedThemes={extractedThemes}
        onThemeAdded={onThemeAdded}
        onRemoveExtractedTheme={onRemoveExtractedTheme}
      />
    </div>
  );
};
