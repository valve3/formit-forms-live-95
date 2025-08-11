
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';

interface FormField {
  id: string;
  field_type: any;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  position: number;
}

interface FieldPropertiesSidebarProps {
  selectedField: FormField | null;
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void;
}

export const FieldPropertiesSidebar = ({ 
  selectedField, 
  onUpdateField 
}: FieldPropertiesSidebarProps) => {
  if (!selectedField) return null;

  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <h3 className="font-medium text-gray-900 mb-4">Field Properties</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={selectedField.label}
            onChange={(e) => onUpdateField(selectedField.id, { label: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="field-placeholder">Placeholder</Label>
          <Input
            id="field-placeholder"
            value={selectedField.placeholder || ''}
            onChange={(e) => onUpdateField(selectedField.id, { placeholder: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={selectedField.required}
            onCheckedChange={(checked) => onUpdateField(selectedField.id, { required: checked })}
          />
          <Label>Required field</Label>
        </div>
        {['select', 'radio', 'checkbox'].includes(selectedField.field_type) && (
          <div>
            <Label>Options</Label>
            <div className="space-y-2 mt-2">
              {selectedField.options?.map((option, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(selectedField.options || [])];
                      newOptions[index] = e.target.value;
                      onUpdateField(selectedField.id, { options: newOptions });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOptions = selectedField.options?.filter((_, i) => i !== index);
                      onUpdateField(selectedField.id, { options: newOptions });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(selectedField.options || []), 'New Option'];
                  onUpdateField(selectedField.id, { options: newOptions });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
