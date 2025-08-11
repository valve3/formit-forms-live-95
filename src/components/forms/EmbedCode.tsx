
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Code, Copy, Eye } from 'lucide-react';

interface EmbedCodeProps {
  formId: string;
  formTitle: string;
}

export const EmbedCode = ({ formId, formTitle }: EmbedCodeProps) => {
  const { toast } = useToast();
  const [height, setHeight] = useState('600');
  const [isResponsive, setIsResponsive] = useState(true);
  const [heightType, setHeightType] = useState<'fixed' | 'auto' | 'viewport'>('auto');
  
  const generateEmbedCode = () => {
    let heightStyle = '';
    let additionalStyles = '';
    
    if (isResponsive) {
      additionalStyles = `
  style="width: 100%; max-width: 100%; border: none; display: block;"`;
      
      switch (heightType) {
        case 'auto':
          heightStyle = 'height="600"';
          additionalStyles += `
  onload="this.style.height = this.contentWindow.document.body.scrollHeight + 'px';"`;
          break;
        case 'viewport':
          heightStyle = 'height="100vh"';
          break;
        case 'fixed':
        default:
          heightStyle = `height="${height}"`;
          break;
      }
    } else {
      heightStyle = `height="${height}"`;
    }

    return `<iframe 
  src="${window.location.origin}/embed/${formId}" 
  width="100%" 
  ${heightStyle} 
  frameborder="0"
  title="${formTitle}"${additionalStyles}>
</iframe>`;
  };

  const embedCode = generateEmbedCode();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: 'Copied!',
      description: 'Embed code copied to clipboard',
    });
  };

  const previewEmbed = () => {
    window.open(`/embed/${formId}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Code className="h-5 w-5" />
          <span>Embed Code</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Responsive Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="responsive"
              checked={isResponsive}
              onCheckedChange={setIsResponsive}
            />
            <Label htmlFor="responsive">Make iframe responsive</Label>
          </div>
          
          {isResponsive && (
            <div className="space-y-4 pl-6 border-l-2 border-gray-200">
              <div>
                <Label className="text-sm font-medium">Height Behavior:</Label>
                <Select value={heightType} onValueChange={(value: 'fixed' | 'auto' | 'viewport') => setHeightType(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-adjust to content</SelectItem>
                    <SelectItem value="fixed">Fixed height</SelectItem>
                    <SelectItem value="viewport">Full viewport height</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {heightType === 'fixed' && (
                <div>
                  <Label className="text-sm font-medium">Height (px):</Label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border rounded-md"
                    min="300"
                    max="1000"
                  />
                </div>
              )}
            </div>
          )}
          
          {!isResponsive && (
            <div>
              <Label className="text-sm font-medium">Height (px):</Label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full mt-2 px-3 py-2 border rounded-md"
                min="300"
                max="1000"
              />
            </div>
          )}
        </div>
        
        <Textarea
          value={embedCode}
          readOnly
          rows={isResponsive ? 8 : 6}
          className="font-mono text-sm"
        />
        
        <div className="flex space-x-2">
          <Button onClick={copyToClipboard} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </Button>
          <Button onClick={previewEmbed} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
        
        {isResponsive && (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <strong>Responsive Features:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Width automatically adjusts to container</li>
              <li>Height behavior configurable (auto, fixed, or viewport)</li>
              <li>Form content inside is fully responsive</li>
              <li>Works on mobile, tablet, and desktop</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
