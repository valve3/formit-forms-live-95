
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Globe, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ExtractedField {
  field_type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface WebsiteFieldExtractorProps {
  onFieldsExtracted: (fields: ExtractedField[]) => void;
}

export const WebsiteFieldExtractor = ({ onFieldsExtracted }: WebsiteFieldExtractorProps) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const extractFields = async () => {
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
      console.log('Extracting fields from:', url);
      const { data, error } = await supabase.functions.invoke('extract-website-fields', {
        body: { url },
      });

      console.log('API Response:', data);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success && data?.fields) {
        console.log('Extracted fields:', data.fields);
        onFieldsExtracted(data.fields);
        
        toast({
          title: 'Fields Extracted',
          description: `Found ${data.fields.length} form fields from the website`,
        });
        
        setUrl('');
      } else {
        console.error('API returned error:', data);
        throw new Error(data?.error || 'Failed to extract form fields');
      }
    } catch (error: any) {
      console.error('Error extracting fields:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to extract website form fields',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Extract Form Fields from Website</span>
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
        <Button
          onClick={extractFields}
          disabled={loading || !url}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Extracting Fields...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Extract Form Fields
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
