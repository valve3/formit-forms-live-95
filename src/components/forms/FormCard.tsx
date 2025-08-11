import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette } from 'lucide-react';
import { useFormOperations } from '@/hooks/useFormOperations';
import { copyEmbedCode, previewForm, getStatusBadgeVariant } from '@/utils/formUtils';
import { FormStyleEditor } from './FormStyleEditor';
import { FormColorPreview } from './FormColorPreview';
import { FormFontPreview } from './FormFontPreview';
import { FormActions } from './FormActions';
import { FormStatusToggle } from './FormStatusToggle';
import { SecurityToggle } from './SecurityToggle';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
    captcha_enabled?: boolean;
  };
}

interface FormCardProps {
  form: Form;
  onEditForm: (formId: string) => void;
  onRefresh: () => void;
}

export const FormCard = ({ form, onEditForm, onRefresh }: FormCardProps) => {
  const { deleteForm, duplicateForm, toggleFormStatus, loading } = useFormOperations();
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const { toast } = useToast();

  const handleDeleteForm = () => {
    deleteForm(form.id, onRefresh);
  };

  const handleDuplicateForm = () => {
    duplicateForm(form.id, onRefresh);
  };

  const handleToggleStatus = () => {
    toggleFormStatus(form.id, form.status, onRefresh);
  };

  const handleCopyEmbedCode = () => {
    copyEmbedCode(form);
  };

  const handlePreviewForm = () => {
    if (!form.id || form.id === 'undefined' || form.id === 'null') {
      toast({
        title: 'Error',
        description: 'This form needs to be saved before it can be previewed',
        variant: 'destructive',
      });
      return;
    }
    previewForm(form.id);
  };

  const handleSecurityToggle = () => {
    onRefresh();
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{form.title}</CardTitle>
              <CardDescription className="mt-1">
                {form.description || 'No description'}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(form.status)}>
              {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Form Theme Preview */}
            <div className="space-y-3">
              <FormColorPreview themeSettings={form.theme_settings} />
              <FormFontPreview fontFamily={form.theme_settings?.fontFamily} />

              {/* Style Editor Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStyleEditor(true)}
                className="w-full"
              >
                <Palette className="h-4 w-4 mr-2" />
                Customize Style
              </Button>
            </div>

            {/* Security Toggle */}
            <SecurityToggle
              formId={form.id}
              securityEnabled={form.theme_settings?.captcha_enabled || false}
              onToggle={handleSecurityToggle}
              loading={loading}
            />

            {/* Publish Toggle */}
            <FormStatusToggle
              formId={form.id}
              status={form.status}
              onToggle={handleToggleStatus}
              loading={loading}
            />

            {/* Action Buttons */}
            <FormActions
              onEdit={() => onEditForm(form.id)}
              onPreview={handlePreviewForm}
              onCopyEmbed={handleCopyEmbedCode}
              onDuplicate={handleDuplicateForm}
              onDelete={handleDeleteForm}
              loading={loading}
            />
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Created {new Date(form.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      <FormStyleEditor
        open={showStyleEditor}
        onOpenChange={setShowStyleEditor}
        form={form}
        onSave={onRefresh}
      />
    </>
  );
};
