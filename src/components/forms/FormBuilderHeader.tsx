
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, ExternalLink, Copy, Save, Eye, EyeOff } from 'lucide-react';

interface FormBuilderHeaderProps {
  onBack: () => void;
  form: any;
  onToggleFormStatus: () => void;
  showSettings: boolean;
  onToggleSettings: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
  onPreviewForm: () => void;
  onCopyEmbedCode: () => void;
  onSaveForm: () => void;
  saving: boolean;
}

export const FormBuilderHeader = ({
  onBack,
  form,
  onToggleFormStatus,
  showSettings,
  onToggleSettings,
  showPreview,
  onTogglePreview,
  onPreviewForm,
  onCopyEmbedCode,
  onSaveForm,
  saving,
}: FormBuilderHeaderProps) => {
  return (
    <div className="bg-white border-b p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        {/* Publish Toggle */}
        {form?.id && (
          <div className="flex items-center space-x-2">
            <Label htmlFor="publish-toggle" className="text-sm font-medium">
              Published
            </Label>
            <Switch
              id="publish-toggle"
              checked={form?.status === 'published'}
              onCheckedChange={onToggleFormStatus}
            />
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          {/* Preview Toggle */}
          <Button
            variant="outline"
            onClick={onTogglePreview}
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          
          <Button
            variant="outline"
            onClick={onToggleSettings}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          {form?.id && (
            <>
              <Button
                variant="outline"
                onClick={onPreviewForm}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                onClick={onCopyEmbedCode}
              >
                <Copy className="h-4 w-4 mr-2" />
                Embed
              </Button>
            </>
          )}
          <Button onClick={onSaveForm} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};
