
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Plus } from 'lucide-react';
import { ThemeEditModal } from './ThemeEditModal';
import { CreateThemeModal } from './CreateThemeModal';
import { ThemeCard } from './ThemeCard';
import { ThemeCategoryFilter } from './ThemeCategoryFilter';
import { FormTheme, ThemePreset } from '@/types/theme';
import { themePresets, categories } from '@/data/themePresets';

interface FormThemesProps {
  currentTheme?: FormTheme;
  onThemeSelect: (theme: FormTheme) => void;
  extractedThemes?: ThemePreset[];
  onRemoveExtractedTheme?: (themeId: string) => void;
}

export const FormThemes = ({ 
  currentTheme, 
  onThemeSelect,
  extractedThemes = [],
  onRemoveExtractedTheme
}: FormThemesProps) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingTheme, setEditingTheme] = useState<ThemePreset | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [customThemes, setCustomThemes] = useState<ThemePreset[]>([]);

  console.log('FormThemes received extractedThemes:', extractedThemes);

  // Convert extracted themes to have "Saved" category
  const savedThemes = extractedThemes.map(theme => ({
    ...theme,
    category: 'Saved'
  }));

  // Combine static, custom, and saved themes
  const allThemes = [...themePresets, ...customThemes, ...savedThemes];
  
  const filteredThemes = selectedCategory === 'All' 
    ? allThemes 
    : allThemes.filter(theme => theme.category === selectedCategory);

  const isThemeSelected = (theme: FormTheme) => {
    return JSON.stringify(theme) === JSON.stringify(currentTheme);
  };

  const handleEditTheme = (theme: ThemePreset) => {
    setEditingTheme({ ...theme });
    setEditModalOpen(true);
  };

  const handleSaveEditedTheme = (editedTheme: ThemePreset) => {
    // Create a new custom theme with a unique ID
    const customTheme = {
      ...editedTheme,
      id: `custom-${Date.now()}`,
      category: 'Saved',
    };
    
    setCustomThemes(prev => [...prev, customTheme]);
    // Include logo and logoSettings when applying theme
    onThemeSelect({
      ...customTheme.theme,
      logo: customTheme.logo,
      logoSettings: customTheme.logoSettings
    });
  };

  const handleCreateNewTheme = (newTheme: ThemePreset) => {
    setCustomThemes(prev => [...prev, newTheme]);
    // Include logo and logoSettings when applying theme
    onThemeSelect({
      ...newTheme.theme,
      logo: newTheme.logo,
      logoSettings: newTheme.logoSettings
    });
  };

  const handleRemoveTheme = (themeId: string) => {
    // Handle removal of custom themes
    setCustomThemes(prev => prev.filter(theme => theme.id !== themeId));
    
    // Handle removal of extracted/saved themes
    if (onRemoveExtractedTheme) {
      onRemoveExtractedTheme(themeId);
    }
  };

  const getSavedThemesCount = () => {
    return savedThemes.length + customThemes.filter(theme => theme.category === 'Saved').length;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Themes</CardTitle>
            </div>
            <Button onClick={() => setCreateModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create New Theme
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Filter */}
          <ThemeCategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            savedThemesCount={getSavedThemesCount()}
          />

          {/* Theme Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredThemes.map((preset) => (
              <ThemeCard
                key={preset.id}
                preset={preset}
                isSelected={isThemeSelected(preset.theme)}
                onSelect={() => onThemeSelect({
                  ...preset.theme,
                  logo: preset.logo,
                  logoSettings: preset.logoSettings
                })}
                onEdit={() => handleEditTheme(preset)}
                onRemove={preset.category === 'Saved' ? () => handleRemoveTheme(preset.id) : undefined}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <ThemeEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        theme={editingTheme}
        onSave={handleSaveEditedTheme}
      />

      <CreateThemeModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSave={handleCreateNewTheme}
      />
    </>
  );
};
