
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityToggleProps {
  formId: string;
  securityEnabled: boolean;
  onToggle: () => void;
  loading?: boolean;
}

export const SecurityToggle = ({ formId, securityEnabled, onToggle, loading }: SecurityToggleProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      // Update the form's security settings in the database
      const { error } = await supabase
        .from('forms')
        .update({ 
          theme_settings: {
            captcha_enabled: !securityEnabled
          }
        })
        .eq('id', formId);

      if (error) throw error;

      toast({
        title: 'Security Settings Updated',
        description: `CAPTCHA ${!securityEnabled ? 'enabled' : 'disabled'} for this form`,
      });

      onToggle();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Shield className="h-4 w-4 text-gray-600" />
        <Label htmlFor={`security-${formId}`} className="text-sm font-medium">
          Security Verification
        </Label>
      </div>
      <Switch
        id={`security-${formId}`}
        checked={securityEnabled}
        onCheckedChange={handleToggle}
        disabled={loading || isUpdating}
      />
    </div>
  );
};
