import { 
  Type,
  Mail,
  Hash,
  AlignLeft,
  List,
  Calendar,
  FileText,
  Phone,
  Link,
  CheckSquare,
  Palette,
  Plus,
  LayoutGrid,
  Columns2,
  Columns3,
  Columns4,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormStyleEditor } from './FormStyleEditor';
import { Database } from '@/integrations/supabase/types';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { FormFieldsImporter } from './FormFieldsImporter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FieldType = Database['public']['Enums']['field_type'];

const fieldTypes = [
  { value: 'text' as const, label: 'Text Input', icon: Type },
  { value: 'email' as const, label: 'Email', icon: Mail },
  { value: 'number' as const, label: 'Number', icon: Hash },
  { value: 'textarea' as const, label: 'Textarea', icon: AlignLeft },
  { value: 'select' as const, label: 'Select Dropdown', icon: List },
  { value: 'radio' as const, label: 'Radio Buttons', icon: List },
  { value: 'checkbox' as const, label: 'Checkboxes', icon: CheckSquare },
  { value: 'date' as const, label: 'Date', icon: Calendar },
  { value: 'file' as const, label: 'File Upload', icon: FileText },
  { value: 'tel' as const, label: 'Phone', icon: Phone },
  { value: 'url' as const, label: 'URL', icon: Link },
];

const layoutControls = [
  { columns: 1, label: '1 Column Row', icon: Plus },
  { columns: 2, label: '2 Column Row', icon: Columns2 },
  { columns: 3, label: '3 Column Row', icon: Columns3 },
  { columns: 4, label: '4 Column Row', icon: Columns4 },
];

interface FieldTypesSidebarProps {
  onAddField: (fieldType: FieldType) => void;
  form?: any;
  onFormUpdate?: (form: any) => void;
  onAddRow?: (columns: number) => void;
  onImportFields?: (fields: any[]) => void;
}

export const FieldTypesSidebar = ({ 
  onAddField, 
  form, 
  onFormUpdate,
  onAddRow,
  onImportFields
}: FieldTypesSidebarProps) => {
  const [showStyleEditor, setShowStyleEditor] = useState(false);

  const handleStyleSave = () => {
    if (onFormUpdate && form) {
      onFormUpdate(form);
    }
  };

  const handleAddRow = (columns: number) => {
    if (onAddRow) {
      onAddRow(columns);
    }
  };

  const handleImportFields = (fields: any[]) => {
    if (onImportFields) {
      onImportFields(fields);
    }
  };

  return (
    <>
      <div className="w-64 bg-white border-r overflow-y-auto">
        <Tabs defaultValue="fields" className="h-full">
          <div className="p-4 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fields">Fields</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="fields" className="p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Field Types</h3>
            
            {/* Customize Style Button */}
            {form && (
              <div>
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
            )}

            <Droppable droppableId="field-types-sidebar" isDropDisabled={true}>
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {fieldTypes.map((fieldType, index) => {
                    const Icon = fieldType.icon;
                    return (
                      <Draggable key={fieldType.value} draggableId={`field-type-${fieldType.value}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 
                              hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer
                              ${snapshot.isDragging ? 'shadow-lg bg-blue-100 border-blue-400' : ''}
                            `}
                            onClick={() => onAddField(fieldType.value)}
                          >
                            <Icon className="h-5 w-5 text-gray-600" />
                            <span className="text-sm">{fieldType.label}</span>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Layout Controls */}
            {onAddRow && (
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="text-sm font-medium">Layout Controls</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">Drag to add rows with different column layouts</p>
                
                <Droppable droppableId="layout-controls-sidebar" isDropDisabled={true}>
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {layoutControls.map((layout, index) => {
                        const Icon = layout.icon;
                        return (
                          <Draggable key={`layout-${layout.columns}`} draggableId={`layout-${layout.columns}-columns`} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 
                                  hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer
                                  ${snapshot.isDragging ? 'shadow-lg bg-green-100 border-green-400' : ''}
                                `}
                                onClick={() => handleAddRow(layout.columns)}
                              >
                                <Icon className="h-5 w-5 text-gray-600" />
                                <span className="text-sm">{layout.label}</span>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="p-4">
            <FormFieldsImporter onImportFields={handleImportFields} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Style Editor Modal */}
      {form && (
        <FormStyleEditor
          open={showStyleEditor}
          onOpenChange={setShowStyleEditor}
          form={form}
          onSave={handleStyleSave}
        />
      )}
    </>
  );
};
