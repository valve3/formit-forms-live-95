import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface StepField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface ImageOption {
  key: string;
  label: string;
  image?: string;
}

interface StepEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: {
    step: number;
    title: string;
    fields: string[];
    description?: string;
  };
  onSave: (stepData: any) => void;
  onImageUpload: (stepNumber: number, imageType: string, imageKey?: string) => void;
  formSettings: any;
}

export const Blue84StepEditor = ({ 
  open, 
  onOpenChange, 
  step, 
  onSave, 
  onImageUpload,
  formSettings 
}: StepEditorProps) => {
  const [stepData, setStepData] = useState(() => ({
    title: step.title,
    description: step.description || '',
    fields: Array.isArray(step.fields) && step.fields.length > 0 && typeof step.fields[0] === 'object'
      ? step.fields.map((field: any, index: number) => ({
          id: field.id || `field_${step.step}_${index}`,
          label: field.label || field,
          type: field.type || 'text',
          required: field.required || false,
          placeholder: field.placeholder || '',
          options: field.options || []
        }))
      : step.fields.map((fieldName: string, index: number) => ({
          id: `field_${step.step}_${index}`,
          label: typeof fieldName === 'string' ? fieldName.replace('*', '') : fieldName,
          type: 'text',
          required: typeof fieldName === 'string' ? fieldName.includes('*') : false,
          placeholder: '',
          options: []
        }))
  }));

  // Update stepData when step prop changes (e.g., when image is uploaded)
  useEffect(() => {
    setStepData({
      title: step.title,
      description: step.description || '',
      fields: Array.isArray(step.fields) && step.fields.length > 0 && typeof step.fields[0] === 'object'
        ? step.fields.map((field: any, index: number) => ({
            id: field.id || `field_${step.step}_${index}`,
            label: field.label || field,
            type: field.type || 'text',
            required: field.required || false,
            placeholder: field.placeholder || '',
            options: field.options || []
          }))
        : step.fields.map((fieldName: string, index: number) => ({
            id: `field_${step.step}_${index}`,
            label: typeof fieldName === 'string' ? fieldName.replace('*', '') : fieldName,
            type: 'text',
            required: typeof fieldName === 'string' ? fieldName.includes('*') : false,
            placeholder: '',
            options: []
          }))
    });
  }, [step]);

  const getInitialImageOptions = (): ImageOption[] => {
    switch (step.step) {
      case 2:
        return [
          { key: 'Nike', label: 'Nike Logo', image: formSettings.brandLogos?.Nike },
          { key: 'Adidas', label: 'Adidas Logo', image: formSettings.brandLogos?.Adidas },
          { key: 'Callaway', label: 'Callaway Logo', image: formSettings.brandLogos?.Callaway }
        ];
      case 3:
        return [
          { key: 'hat', label: 'Hat', image: formSettings.productImages?.hat },
          { key: 'casual-wear', label: 'Casual Wear', image: formSettings.productImages?.['casual-wear'] },
          { key: 'socks', label: 'Socks', image: formSettings.productImages?.socks },
          { key: 'active-wear', label: 'Active Wear', image: formSettings.productImages?.['active-wear'] },
          { key: 'trending', label: 'Trending', image: formSettings.productImages?.trending },
          { key: 'not-sure', label: 'Not Sure', image: formSettings.productImages?.['not-sure'] }
        ];
      default:
        return [];
    }
  };

  const [imageOptions, setImageOptions] = useState<ImageOption[]>(getInitialImageOptions);
  const [editingImageKey, setEditingImageKey] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSave = () => {
    // Convert fields back to the format expected by the form
    const formattedFields = stepData.fields.map(field => ({
      id: field.id,
      label: field.label,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder,
      options: field.options
    }));

    const updatedStep = {
      ...step,
      title: stepData.title,
      description: stepData.description,
      fields: formattedFields,
      imageOptions: imageOptions
    };

    onSave(updatedStep);
    
    console.log('Saving step data:', updatedStep);
    
    toast({
      title: 'Step Updated',
      description: `Step ${step.step} has been updated successfully.`,
    });
    onOpenChange(false);
  };

  const addField = () => {
    setStepData(prev => ({
      ...prev,
      fields: [...prev.fields, {
        id: `field_${step.step}_${Date.now()}`,
        label: 'New Field',
        type: 'text',
        required: false,
        placeholder: '',
        options: []
      }]
    }));
  };

  const updateField = (fieldId: string, updates: Partial<StepField>) => {
    setStepData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (fieldId: string) => {
    setStepData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const addOption = (fieldId: string) => {
    updateField(fieldId, {
      options: [...(stepData.fields.find(f => f.id === fieldId)?.options || []), 'New Option']
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = stepData.fields.find(f => f.id === fieldId);
    if (field?.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = stepData.fields.find(f => f.id === fieldId);
    if (field?.options) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  const addCardOption = (fieldId: string, fieldType: string) => {
    const defaultCardOption = fieldType === 'brand-cards' 
                              ? { id: 'new-brand', name: 'New Brand', description: 'Brand description' }
                              : fieldType === 'garment-cards'
                              ? { id: 'new-garment', name: 'New Garment', description: '', icon: 'user' }
                              : { id: 'new-option', name: 'New Option', icon: 'check' };
    
    const field = stepData.fields.find(f => f.id === fieldId);
    const currentOptions = field?.options || [];
    updateField(fieldId, { options: [...currentOptions, defaultCardOption] });
  };

  const updateCardOption = (fieldId: string, optionIndex: number, updates: any) => {
    const field = stepData.fields.find(f => f.id === fieldId);
    if (field?.options) {
      const newOptions = [...field.options];
      if (typeof newOptions[optionIndex] === 'string') {
        // Convert string to object if needed
        const stringValue = newOptions[optionIndex] as string;
        newOptions[optionIndex] = {
          id: stringValue.toLowerCase().replace(/\s+/g, '-'),
          name: stringValue,
          description: '',
          ...updates
        };
      } else {
        newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
      }
      updateField(fieldId, { options: newOptions });
    }
  };

  const addImageOption = () => {
    const newKey = `option_${Date.now()}`;
    setImageOptions(prev => [...prev, {
      key: newKey,
      label: 'New Image Option',
      image: undefined
    }]);
  };

  const updateImageOption = (key: string, updates: Partial<ImageOption>) => {
    setImageOptions(prev => prev.map(option => 
      option.key === key ? { ...option, ...updates } : option
    ));
  };

  const removeImageOption = (key: string) => {
    setImageOptions(prev => prev.filter(option => option.key !== key));
  };

  const duplicateImageOption = (key: string) => {
    const optionToDuplicate = imageOptions.find(option => option.key === key);
    if (optionToDuplicate) {
      const newKey = `${key}_copy_${Date.now()}`;
      setImageOptions(prev => [...prev, {
        ...optionToDuplicate,
        key: newKey,
        label: `${optionToDuplicate.label} (Copy)`
      }]);
    }
  };

  const hasImages = imageOptions.length > 0;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(stepData.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setStepData(prev => ({
      ...prev,
      fields: items
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Step {step.step}: {step.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Step Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="step-title">Step Title</Label>
                <Input
                  id="step-title"
                  value={stepData.title}
                  onChange={(e) => setStepData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="step-description">Description</Label>
                <Textarea
                  id="step-description"
                  value={stepData.description}
                  onChange={(e) => setStepData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this step"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fields Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Form Fields ({stepData.fields.length})</CardTitle>
                <Button onClick={addField} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {stepData.fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No fields added yet.</p>
                  <Button onClick={addField} variant="outline" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first field
                  </Button>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="fields">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {stepData.fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-4 border rounded-lg space-y-3 transition-all ${
                                  snapshot.isDragging ? 'shadow-lg rotate-1 bg-background/95' : 'bg-background'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <h4 className="font-medium">Field Configuration</h4>
                                  </div>
                                  <Button
                                    onClick={() => removeField(field.id)}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Field Label</Label>
                                    <Input
                                      value={field.label}
                                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                                      placeholder="Enter field label"
                                    />
                                  </div>
                                  <div>
                                    <Label>Field Type</Label>
                                    <select
                                      value={field.type}
                                      onChange={(e) => updateField(field.id, { type: e.target.value })}
                                      className="w-full p-2 border rounded"
                                    >
                                      <option value="text">Text</option>
                                      <option value="email">Email</option>
                                      <option value="tel">Phone</option>
                                      <option value="number">Number</option>
                                      <option value="select">Select</option>
                                      <option value="checkbox">Checkbox</option>
                                      <option value="radio">Radio</option>
                                      <option value="textarea">Textarea</option>
                                      <option value="brand-cards">Brand Cards</option>
                                      <option value="garment-cards">Garment Cards</option>
                                      <option value="quantity-buttons">Quantity Buttons</option>
                                      <option value="budget-slider">Budget Slider</option>
                                      <option value="custom-artwork-cards">Custom Artwork Cards</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Placeholder</Label>
                                    <Input
                                      value={field.placeholder || ''}
                                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                      placeholder="Enter placeholder text"
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2 pt-6">
                                    <input
                                      type="checkbox"
                                      id={`required-${field.id}`}
                                      checked={field.required}
                                      onChange={(e) => {
                                        console.log(`Updating field ${field.id} required to:`, e.target.checked);
                                        updateField(field.id, { required: e.target.checked });
                                      }}
                                      className="rounded border-gray-300"
                                    />
                                    <Label htmlFor={`required-${field.id}`} className="text-sm font-medium">
                                      Required field
                                    </Label>
                                  </div>
                                </div>

                                {/* Options for select/radio/checkbox fields */}
                                {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox' || field.type === 'quantity-buttons' || field.type === 'budget-slider') && (
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <Label>Options</Label>
                                      <Button
                                        onClick={() => addOption(field.id)}
                                        variant="outline"
                                        size="sm"
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Option
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      {field.options?.map((option, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <Input
                                            value={option}
                                            onChange={(e) => updateOption(field.id, index, e.target.value)}
                                            placeholder="Option text"
                                          />
                                          <Button
                                            onClick={() => removeOption(field.id, index)}
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )) || []}
                                      {(!field.options || field.options.length === 0) && (
                                        <p className="text-sm text-gray-500 italic">No options added yet</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Card options for brand-cards and garment-cards */}
                                {(field.type === 'brand-cards' || field.type === 'garment-cards' || field.type === 'custom-artwork-cards') && (
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <Label>Card Options</Label>
                                      <Button
                                        onClick={() => addCardOption(field.id, field.type)}
                                        variant="outline"
                                        size="sm"
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Card
                                      </Button>
                                    </div>
                                    <div className="space-y-4">
                                      {field.options?.map((option, index) => {
                                        const cardOption = typeof option === 'string' ? 
                                          { id: option.toLowerCase().replace(/\s+/g, '-'), name: option, description: '' } :
                                          option;
                                        
                                        return (
                                          <div key={index} className="p-4 border rounded-lg space-y-3">
                                            <div className="flex items-center justify-between">
                                              <h5 className="font-medium">Card {index + 1}</h5>
                                              <Button
                                                onClick={() => removeOption(field.id, index)}
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <Label>Card Name</Label>
                                                <Input
                                                  value={cardOption.name || ''}
                                                  onChange={(e) => updateCardOption(field.id, index, { name: e.target.value })}
                                                  placeholder="Card name"
                                                />
                                              </div>
                                              <div>
                                                <Label>Card ID</Label>
                                                <Input
                                                  value={cardOption.id || ''}
                                                  onChange={(e) => updateCardOption(field.id, index, { id: e.target.value })}
                                                  placeholder="Unique identifier"
                                                />
                                              </div>
                                            </div>
                                            
                                            <div>
                                              <Label>Description</Label>
                                              <Input
                                                value={cardOption.description || ''}
                                                onChange={(e) => updateCardOption(field.id, index, { description: e.target.value })}
                                                placeholder="Card description"
                                              />
                                            </div>
                                            
                                            {(field.type === 'garment-cards' || field.type === 'custom-artwork-cards') && (
                                              <div>
                                                <Label>Icon Type</Label>
                                                <select
                                                  value={cardOption.icon || 'user'}
                                                  onChange={(e) => updateCardOption(field.id, index, { icon: e.target.value })}
                                                  className="w-full p-2 border rounded"
                                                >
                                                  <option value="hat">Hat</option>
                                                  <option value="shirt">Shirt</option>
                                                  <option value="socks">Socks</option>
                                                  <option value="sun">Sun</option>
                                                  <option value="trending-up">Trending Up</option>
                                                  <option value="help-circle">Help Circle</option>
                                                  <option value="check">Check</option>
                                                  <option value="x">X</option>
                                                </select>
                                              </div>
                                            )}
                                            
                                            {field.type === 'brand-cards' && (
                                              <div className="flex items-center space-x-4">
                                                <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                                                  {cardOption.image ? (
                                                    <img 
                                                      src={cardOption.image} 
                                                      alt={cardOption.name} 
                                                      className="h-14 w-14 object-contain" 
                                                    />
                                                  ) : (
                                                    <div className="text-gray-400 text-xs text-center">No image</div>
                                                  )}
                                                </div>
                                                <Button
                                                  onClick={() => onImageUpload(step.step, 'card-image', `${field.id}-${index}`)}
                                                  variant="outline"
                                                  size="sm"
                                                >
                                                  <Upload className="h-4 w-4 mr-2" />
                                                  Upload Image
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }) || []}
                                      {(!field.options || field.options.length === 0) && (
                                        <p className="text-sm text-gray-500 italic">No card options added yet</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>


          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
