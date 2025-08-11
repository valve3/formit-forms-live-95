
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, Code, Copy, Palette } from 'lucide-react';
import { FormColorPreview } from './FormColorPreview';
import { FormFontPreview } from './FormFontPreview';
import { FormStatusToggle } from './FormStatusToggle';
import { SecurityToggle } from './SecurityToggle';

interface Blue84FormData {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  created_at: string;
  theme_settings: {
    primaryColor: string;
    backgroundColor: string;
    buttonColor: string;
    borderColor: string;
    cardBackground: string;
    fontFamily: string;
    textColor: string;
    captcha_enabled?: boolean;
  };
  email_settings: {
    enabled: boolean;
    emails: string[];
  };
}

interface Blue84FormCardProps {
  blue84FormData: Blue84FormData;
  blue84Status: 'draft' | 'published';
  onEditBlue84Form: () => void;
  onViewBlue84Form: () => void;
  onCopyBlue84Embed: () => void;
  onDuplicateBlue84: () => void;
  onToggleBlue84Status: () => void;
  onBlue84SecurityToggle: () => void;
}

export const Blue84FormCard = ({
  blue84FormData,
  blue84Status,
  onEditBlue84Form,
  onViewBlue84Form,
  onCopyBlue84Embed,
  onDuplicateBlue84,
  onToggleBlue84Status,
  onBlue84SecurityToggle
}: Blue84FormCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow border-blue-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg text-blue-700">Blue84 Multi-Step Order Form</CardTitle>
            <CardDescription className="mt-1">
              Multi-step order form for custom apparel and promotional products with email notifications
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Multi-Step Template
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">Multi-step</Badge>
            <Badge variant="secondary" className="text-xs">Contact Info</Badge>
            <Badge variant="secondary" className="text-xs">Product Selection</Badge>
            <Badge variant="secondary" className="text-xs">Budget Range</Badge>
            <Badge variant="secondary" className="text-xs">Email Notifications</Badge>
          </div>

          {/* Form Theme Preview */}
          <div className="space-y-3">
            <FormColorPreview themeSettings={blue84FormData.theme_settings} />
            <FormFontPreview fontFamily={blue84FormData.theme_settings?.fontFamily} />

            {/* Email Settings Status */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Email Notifications</span>
              <Badge variant={blue84FormData.email_settings?.enabled ? "default" : "secondary"} className="text-xs">
                {blue84FormData.email_settings?.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            {/* Security Toggle */}
            <SecurityToggle
              formId={blue84FormData.id}
              securityEnabled={blue84FormData.theme_settings?.captcha_enabled || false}
              onToggle={onBlue84SecurityToggle}
              loading={false}
            />

            {/* Style Editor Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onEditBlue84Form}
              className="w-full"
            >
              <Palette className="h-4 w-4 mr-2" />
              Customize Form & Settings
            </Button>
          </div>

          {/* Publish Toggle */}
          <FormStatusToggle
            formId={blue84FormData.id}
            status={blue84Status}
            onToggle={onToggleBlue84Status}
            loading={false}
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEditBlue84Form}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onViewBlue84Form}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyBlue84Embed}
            >
              <Code className="h-4 w-4 mr-1" />
              Embed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicateBlue84}
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Created {new Date(blue84FormData.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};
