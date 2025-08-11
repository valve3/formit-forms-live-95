
import { Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, Trash2 } from 'lucide-react';

interface FormField {
  id: string;
  field_type: any;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  position: number;
  page?: number;
  row?: number;
}

interface FieldRendererProps {
  field: FormField;
  index: number;
  selectedField: string | null;
  onSelectField: (fieldId: string) => void;
  onDeleteField: (fieldId: string) => void;
}

export const FieldRenderer = ({
  field,
  index,
  selectedField,
  onSelectField,
  onDeleteField,
}: FieldRendererProps) => {
  const renderFieldPreview = (field: FormField) => {
    const commonProps = {
      placeholder: field.placeholder,
      required: field.required,
      className: 'preview-form-input',
    };

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
        return <Input type={field.field_type} {...commonProps} />;
      case 'number':
        return <Input type="number" {...commonProps} />;
      case 'textarea':
        return <Textarea {...commonProps} />;
      case 'date':
        return <Input type="date" {...commonProps} />;
      case 'file':
        return <Input type="file" {...commonProps} />;
      case 'select':
        return (
          <Select>
            <SelectTrigger className="preview-form-input">
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="radio" name={field.id} id={`${field.id}_${index}`} />
                <label htmlFor={`${field.id}_${index}`} className="preview-form-label">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="checkbox" id={`${field.id}_${index}`} />
                <label htmlFor={`${field.id}_${index}`} className="preview-form-label">{option}</label>
              </div>
            ))}
          </div>
        );
      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <Draggable key={field.id} draggableId={field.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`
            p-4 border rounded-lg cursor-pointer transition-colors bg-white mb-2
            ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
            ${selectedField === field.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
          onClick={() => onSelectField(field.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div {...provided.dragHandleProps}>
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <Label className="font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteField(field.id);
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {renderFieldPreview(field)}
        </div>
      )}
    </Draggable>
  );
};
