
import { Droppable } from '@hello-pangea/dnd';
import { FileText, Plus } from 'lucide-react';
import { FieldRenderer } from './FieldRenderer';

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

interface MainDropZoneProps {
  fieldsWithoutRows: FormField[];
  selectedField: string | null;
  onSelectField: (fieldId: string) => void;
  onDeleteField: (fieldId: string) => void;
  rowsCount: number;
}

export const MainDropZone = ({
  fieldsWithoutRows,
  selectedField,
  onSelectField,
  onDeleteField,
  rowsCount,
}: MainDropZoneProps) => {
  return (
    <Droppable droppableId="main-form">
      {(provided, snapshot) => (
        <div 
          {...provided.droppableProps} 
          ref={provided.innerRef}
          className={`border rounded-lg p-4 min-h-[200px] ${
            snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
          }`}
        >
          <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Form Fields</span>
          </h4>
          
          <div className="space-y-4">
            {fieldsWithoutRows.map((field, index) => (
              <FieldRenderer
                key={field.id}
                field={field}
                index={index}
                selectedField={selectedField}
                onSelectField={onSelectField}
                onDeleteField={onDeleteField}
              />
            ))}
            {provided.placeholder}
            
            {fieldsWithoutRows.length === 0 && rowsCount === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Plus className="h-8 w-8 mx-auto mb-2" />
                <p>Add fields from the sidebar</p>
                <p className="text-sm mt-1">Use the layout controls to create rows with different column layouts</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Droppable>
  );
};
