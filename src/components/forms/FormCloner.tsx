import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  FileText, 
  Loader2, 
  Palette, 
  CheckCircle, 
  Copy, 
  Plus,
  AlertCircle,
  Code,
  Image,
  Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ExtractedField {
  field_type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: (string | { value?: string; text?: string })[];
}

interface ExtractedTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  buttonColor: string;
  buttonTextColor: string;
  cardBackground: string;
}

interface FormClonerProps {
  onFormCloned?: (formId: string) => void;
}

export const FormCloner = ({ onFormCloned }: FormClonerProps) => {
  const [url, setUrl] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'url' | 'html' | 'image'>('url');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [extractFields, setExtractFields] = useState(true);
  const [extractTheme, setExtractTheme] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'input' | 'extracting' | 'review'>('input');
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [extractedTheme, setExtractedTheme] = useState<ExtractedTheme | null>(null);
  const [extractionErrors, setExtractionErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleExtraction = async () => {
    if (inputMode === 'url' && !url) {
      toast({
        title: 'Error',
        description: 'Please enter a website URL',
        variant: 'destructive',
      });
      return;
    }

    if (inputMode === 'html' && !htmlCode) {
      toast({
        title: 'Error',
        description: 'Please paste HTML code',
        variant: 'destructive',
      });
      return;
    }

    if (inputMode === 'image' && !imageFile) {
      toast({
        title: 'Error',
        description: 'Please select an image',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to clone forms',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setCurrentStep('extracting');
    setExtractionErrors([]);
    
    try {
      const promises = [];
      
      // For image mode, use the combined extract-form-from-image function
      if (inputMode === 'image') {
        const imageData = await convertFileToBase64(imageFile!);
        promises.push(
          supabase.functions.invoke('extract-form-from-image', { body: { imageData } })
        );
      } else {
        // Extract fields if enabled
        if (extractFields) {
          const requestBody = inputMode === 'url' 
            ? { url } 
            : { html: htmlCode };
          promises.push(
            supabase.functions.invoke('extract-website-fields', { body: requestBody })
          );
        }
        
        // Extract theme if enabled
        if (extractTheme) {
          const requestBody = inputMode === 'url' 
            ? { url, provider: 'gemini' } 
            : { html: htmlCode, provider: 'gemini' };
          promises.push(
            supabase.functions.invoke('extract-website-theme', { body: requestBody })
          );
        }
      }

      const results = await Promise.allSettled(promises);
      const errors: string[] = [];

      if (inputMode === 'image') {
        // For image mode, we get both fields and theme from the same function
        const result = results[0];
        if (result.status === 'fulfilled' && result.value.data) {
          setExtractedFields(result.value.data.fields || []);
          setExtractedTheme(result.value.data.theme || null);
        } else {
          errors.push('Failed to extract form data from image');
          setExtractedFields([]);
          setExtractedTheme(null);
        }
      } else {
        // Process fields result
        if (extractFields) {
          const fieldsResult = results[0];
          if (fieldsResult.status === 'fulfilled' && fieldsResult.value.data?.success) {
            setExtractedFields(fieldsResult.value.data.fields || []);
          } else {
            errors.push('Failed to extract form fields');
            setExtractedFields([]);
          }
        }

        // Process theme result
        if (extractTheme) {
          const themeResultIndex = extractFields ? 1 : 0;
          const themeResult = results[themeResultIndex];
          if (themeResult.status === 'fulfilled' && themeResult.value.data?.success) {
            setExtractedTheme(themeResult.value.data.theme || null);
          } else {
            errors.push('Failed to extract theme colors');
            setExtractedTheme(null);
          }
        }
      }

      setExtractionErrors(errors);
      
      // Auto-generate form title if not provided
      if (!formTitle) {
        if (inputMode === 'url') {
          const domain = new URL(url).hostname.replace('www.', '');
          setFormTitle(`Form from ${domain}`);
        } else if (inputMode === 'html') {
          setFormTitle('Form from HTML Code');
        } else {
          setFormTitle('Form from Image');
        }
      }

      setCurrentStep('review');
      
      toast({
        title: 'Extraction Complete',
        description: `Successfully analyzed ${inputMode === 'url' ? url : 'HTML code'}`,
      });
      
    } catch (error: any) {
      console.error('Error during extraction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to extract form data',
        variant: 'destructive',
      });
      setCurrentStep('input');
    } finally {
      setLoading(false);
    }
  };

  const createForm = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create forms',
        variant: 'destructive',
      });
      return;
    }

    if (!formTitle) {
      toast({
        title: 'Error',
        description: 'Please enter a form title',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create theme settings
      const themeSettings = extractedTheme ? {
        primaryColor: extractedTheme.primaryColor,
        backgroundColor: extractedTheme.backgroundColor,
        textColor: extractedTheme.textColor,
        borderColor: extractedTheme.borderColor,
        buttonColor: extractedTheme.buttonColor,
        buttonTextColor: extractedTheme.buttonTextColor,
        cardBackground: extractedTheme.cardBackground,
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        maxWidth: 600,
        padding: 24,
        borderRadius: 8,
        cardShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      } : {
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
      };

      // Create the form
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .insert({
          title: formTitle,
          description: formDescription || (inputMode === 'url' ? `Form cloned from ${url}` : 'Form cloned from HTML code'),
          status: 'draft',
          theme_settings: themeSettings,
          email_settings: {},
          layout_settings: {
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
          },
          user_id: user.id,
        })
        .select()
        .single();

      if (formError) throw formError;

      // Create form fields if any were extracted
      if (extractedFields.length > 0) {
        const fieldsToInsert = extractedFields.map((field, index) => {
          // Handle options properly - convert objects to strings
          let processedOptions = null;
          if (field.options && Array.isArray(field.options)) {
            const optionStrings = field.options.map(option => {
              if (typeof option === 'string') {
                return option;
              } else if (typeof option === 'object' && option !== null) {
                return option.text || option.value || String(option);
              }
              return String(option);
            });
            processedOptions = JSON.stringify(optionStrings);
          } else if (field.options) {
            processedOptions = JSON.stringify([String(field.options)]);
          }

          return {
            form_id: formData.id,
            field_type: field.field_type as any,
            label: field.label,
            placeholder: field.placeholder || '',
            required: field.required,
            options: processedOptions,
            position: index,
          };
        });

        const { error: fieldsError } = await supabase
          .from('form_fields')
          .insert(fieldsToInsert);

        if (fieldsError) throw fieldsError;
      }

      toast({
        title: 'Form Cloned Successfully!',
        description: `${formTitle} has been created with ${extractedFields.length} fields`,
      });

      // Reset form
      setUrl('');
      setHtmlCode('');
      setFormTitle('');
      setFormDescription('');
      setExtractedFields([]);
      setExtractedTheme(null);
      setCurrentStep('input');
      
      // Callback to parent
      onFormCloned?.(formData.id);

    } catch (error: any) {
      console.error('Error creating form:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create form',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderInputStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Clone Any Form from the Web</h3>
        <p className="text-sm text-muted-foreground">
          Enter a website URL or paste HTML code to extract form fields and styling
        </p>
      </div>

      <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as 'url' | 'html' | 'image')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="url" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Website URL</span>
          </TabsTrigger>
          <TabsTrigger value="html" className="flex items-center space-x-2">
            <Code className="h-4 w-4" />
            <span>HTML Code</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center space-x-2">
            <Image className="h-4 w-4" />
            <span>Image</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div>
            <Label htmlFor="website-url">Website URL</Label>
            <Input
              id="website-url"
              type="url"
              placeholder="https://example.com/contact"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="html" className="space-y-4">
          <div>
            <Label htmlFor="html-code">HTML Code</Label>
            <Textarea
              id="html-code"
              placeholder="Paste your HTML code here..."
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <div>
            <Label htmlFor="form-image">Upload Form Image</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Form preview"
                        className="w-full h-48 object-contain rounded-lg"
                      />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, JPEG (MAX. 10MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              {imageFile && (
                <div className="text-sm text-gray-600">
                  Selected: {imageFile.name}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="extract-fields"
            checked={extractFields}
            onCheckedChange={setExtractFields}
          />
          <Label htmlFor="extract-fields">Extract form fields</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="extract-theme"
            checked={extractTheme}
            onCheckedChange={setExtractTheme}
          />
          <Label htmlFor="extract-theme">Extract theme colors</Label>
        </div>
      </div>

      <Button
        onClick={handleExtraction}
        disabled={loading || (inputMode === 'url' ? !url : inputMode === 'html' ? !htmlCode : !imageFile) || (!extractFields && !extractTheme)}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing {inputMode === 'url' ? 'Website' : inputMode === 'html' ? 'HTML Code' : 'Image'}...
          </>
        ) : (
          <>
            {inputMode === 'url' ? <Globe className="h-4 w-4 mr-2" /> : inputMode === 'html' ? <Code className="h-4 w-4 mr-2" /> : <Image className="h-4 w-4 mr-2" />}
            Clone Form
          </>
        )}
      </Button>
    </div>
  );

  const renderExtractionStep = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        <h3 className="text-lg font-semibold">Analyzing Website</h3>
        <p className="text-sm text-muted-foreground">
          Using AI to extract form fields and theme colors from {inputMode === 'url' ? url : 'HTML code'}
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <FileText className="h-4 w-4" />
          <span className="text-sm">Extracting form fields...</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Palette className="h-4 w-4" />
          <span className="text-sm">Analyzing theme colors...</span>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
        <h3 className="text-lg font-semibold">Extraction Complete</h3>
        <p className="text-sm text-muted-foreground">
          Review the extracted data and customize your form
        </p>
      </div>

      {extractionErrors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Partial Success</span>
          </div>
          {extractionErrors.map((error, index) => (
            <p key={index} className="text-sm text-amber-600">{error}</p>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="form-title">Form Title</Label>
          <Input
            id="form-title"
            placeholder="Enter form title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="form-description">Description (optional)</Label>
          <Textarea
            id="form-description"
            placeholder="Enter form description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {extractedFields.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Extracted Fields ({extractedFields.length})</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {extractedFields.map((field, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{field.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {field.field_type}
                    </Badge>
                    {field.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  {field.placeholder && (
                    <p className="text-sm text-muted-foreground">
                      Placeholder: {field.placeholder}
                    </p>
                  )}
                  {field.options && (
                    <p className="text-sm text-muted-foreground">
                      Options: {Array.isArray(field.options) 
                        ? field.options.map(option => 
                            typeof option === 'string' ? option : option.text || option.value || String(option)
                          ).join(', ')
                        : String(field.options)
                      }
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {extractedTheme && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span className="font-medium">Extracted Theme</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(extractedTheme).map(([key, color]) => (
              <div key={key} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm">{key}: {color}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          onClick={() => setCurrentStep('input')}
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={createForm}
          disabled={loading || !formTitle}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Form...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Copy className="h-5 w-5" />
          <span>AI Form Cloner</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentStep === 'input' && renderInputStep()}
        {currentStep === 'extracting' && renderExtractionStep()}
        {currentStep === 'review' && renderReviewStep()}
      </CardContent>
    </Card>
  );
};