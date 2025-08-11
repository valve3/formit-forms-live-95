
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Mail, Plus, Trash2 } from 'lucide-react';

interface EmailSettingsProps {
  emailSettings: any;
  onUpdate: (settings: any) => void;
}

export const EmailSettings = ({ emailSettings, onUpdate }: EmailSettingsProps) => {
  const [emails, setEmails] = useState<string[]>(emailSettings?.emails || ['']);
  const [enabled, setEnabled] = useState(emailSettings?.enabled || false);

  const addEmail = () => {
    setEmails([...emails, '']);
  };

  const removeEmail = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
    onUpdate({ enabled, emails: newEmails });
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
    onUpdate({ enabled, emails: newEmails });
  };

  const toggleEnabled = (checked: boolean) => {
    setEnabled(checked);
    onUpdate({ enabled: checked, emails });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Email Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch checked={enabled} onCheckedChange={toggleEnabled} />
          <Label>Send submissions via email</Label>
        </div>

        {enabled && (
          <div className="space-y-3">
            <Label>Email addresses to notify:</Label>
            {emails.map((email, index) => (
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
                  disabled={emails.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addEmail}>
              <Plus className="h-4 w-4 mr-2" />
              Add Email
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
