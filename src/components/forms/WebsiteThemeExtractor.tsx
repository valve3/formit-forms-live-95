
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Globe, Palette, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ColorSelectionModal } from './ColorSelectionModal';

interface ThemeColors {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  cardBackground?: string;
  fontFamily?: string;
  fontSize?: number;
  maxWidth?: number;
  padding?: number;
  borderRadius?: number;
  cardShadow?: string;
}

interface WebsiteThemeExtractorProps {
  onThemeExtracted: (theme: ThemeColors) => void;
  compact?: boolean;
  formTitle?: string;
  onThemeAdded?: (theme: any) => void;
  onPaletteAdded?: (palette: { id: string; name: string; colors: string[]; websiteUrl: string }) => void;
}

export const WebsiteThemeExtractor = ({ 
  onThemeExtracted, 
  compact = false, 
  formTitle = 'Extracted Theme',
  onThemeAdded,
  onPaletteAdded
}: WebsiteThemeExtractorProps) => {
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState<'openai' | 'gemini'>('gemini');
  const [loading, setLoading] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const { toast } = useToast();

  const extractColors = async () => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'Please enter a website URL',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Extracting colors from:', url);
      const { data, error } = await supabase.functions.invoke('extract-website-theme', {
        body: { url, provider },
      });

      console.log('API Response:', data);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success && data?.debug?.foundColors) {
        console.log('Found colors:', data.debug.foundColors);
        setExtractedColors(data.debug.foundColors || []);
        setShowColorModal(true);
        
        toast({
          title: 'Colors Found',
          description: `Found ${data.debug.foundColors.length} colors from the website`,
        });
      } else {
        console.error('API returned error:', data);
        throw new Error(data?.error || 'Failed to extract colors');
      }
    } catch (error: any) {
      console.error('Error extracting colors:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to extract website colors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleColorsSelected = (selectedColors: any) => {
    console.log('Colors selected:', selectedColors);
    
    // Create a complete theme object with the selected colors
    const completeTheme: ThemeColors = {
      ...selectedColors,
      fontFamily: 'Inter, sans-serif',
      fontSize: 14,
      maxWidth: 600,
      padding: 24,
      borderRadius: 8,
      cardShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    };

    console.log('Complete theme being applied:', completeTheme);

    // Apply the theme
    onThemeExtracted(completeTheme);

    // Create a new theme preset and add it to the prebuilt themes
    const newThemePreset = {
      id: `extracted-${Date.now()}`,
      name: `${formTitle} (${new URL(url).hostname})`,
      description: `Extracted from ${url}`,
      category: 'Extracted',
      theme: completeTheme,
    };

    console.log('New theme preset:', newThemePreset);

    // Notify parent component to add this theme
    if (onThemeAdded) {
      onThemeAdded(newThemePreset);
    }

    // Create and save the color palette
    if (onPaletteAdded) {
      const palette = {
        id: `palette-${Date.now()}`,
        name: new URL(url).hostname,
        colors: extractedColors,
        websiteUrl: url,
      };
      onPaletteAdded(palette);
    }

    toast({
      title: 'Success',
      description: `Theme colors applied and palette saved from ${new URL(url).hostname}`,
    });
    
    // Clear the URL
    setUrl('');
  };

  if (compact) {
    return (
      <>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              type="url"
              placeholder="Website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Select value={provider} onValueChange={(value: 'openai' | 'gemini') => setProvider(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={extractColors}
              disabled={loading || !url}
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Palette className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <ColorSelectionModal
          open={showColorModal}
          onOpenChange={setShowColorModal}
          foundColors={extractedColors}
          websiteUrl={url}
          onColorsSelected={handleColorsSelected}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Extract Theme from Website</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="website-url">Website URL</Label>
            <Input
              id="website-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ai-provider">AI Provider</Label>
            <Select value={provider} onValueChange={(value: 'openai' | 'gemini') => setProvider(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={extractColors}
            disabled={loading || !url}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Extracting Colors...
              </>
            ) : (
              <>
                <Palette className="h-4 w-4 mr-2" />
                Extract & Choose Colors
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <ColorSelectionModal
        open={showColorModal}
        onOpenChange={setShowColorModal}
        foundColors={extractedColors}
        websiteUrl={url}
        onColorsSelected={handleColorsSelected}
      />
    </>
  );
};
