
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface FormStatusToggleProps {
  formId: string;
  status: 'draft' | 'published' | 'archived';
  onToggle: () => void;
  loading: boolean;
}

export const FormStatusToggle = ({ formId, status, onToggle, loading }: FormStatusToggleProps) => {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={`publish-${formId}`} className="text-sm font-medium">
        Published
      </Label>
      <Switch
        id={`publish-${formId}`}
        checked={status === 'published'}
        onCheckedChange={onToggle}
        disabled={loading}
      />
    </div>
  );
};
