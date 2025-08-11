
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Mail } from 'lucide-react';

interface EmailSettings {
  enabled?: boolean;
  emails?: string[];
}

interface FormEmailSettingsProps {
  emailSettings: EmailSettings;
  onUpdate: (settings: EmailSettings) => void;
}

export const FormEmailSettings = ({ emailSettings, onUpdate }: FormEmailSettingsProps) => {
  const updateEmailSettings = (enabled: boolean, emails: string[]) => {
    onUpdate({ enabled, emails });
  };

  const addEmail = () => {
    onUpdate({
      ...emailSettings,
      emails: [...(emailSettings.emails || []), '']
    });
  };

  const removeEmail = (index: number) => {
    onUpdate({
      ...emailSettings,
      emails: (emailSettings.emails || []).filter((_, i) => i !== index)
    });
  };

  const updateEmail = (index: number, value: string) => {
    onUpdate({
      ...emailSettings,
      emails: (emailSettings.emails || []).map((email, i) => i === index ? value : email)
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Mail className="h-5 w-5" />
        Email Notifications
      </h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            checked={emailSettings.enabled || false} 
            onCheckedChange={(checked) => updateEmailSettings(checked, emailSettings.emails || [''])} 
          />
          <Label>Send submissions via email</Label>
        </div>

        {emailSettings.enabled && (
          <div className="space-y-3">
            <Label>Email addresses to notify:</Label>
            {(emailSettings.emails || ['']).map((email, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  placeholder="Enter email address"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEmail(index)}
                  disabled={(emailSettings.emails || []).length === 1}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addEmail}>
              + Add Email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
