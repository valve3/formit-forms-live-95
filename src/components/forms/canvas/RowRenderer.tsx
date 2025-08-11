
import { Droppable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid2X2, Trash2, Plus } from 'lucide-react';
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

interface RowRendererProps {
  row: any;
  rowIndex: number;
  rowFields: FormField[];
  selectedField: string | null;
  onSelectField: (fieldId: string) => void;
  onDeleteField: (fieldId: string) => void;
  updateRowColumns: (rowId: string, columns: number) => void;
  deleteRow: (rowId: string) => void;
}

export const RowRenderer = ({
  row,
  rowIndex,
  rowFields,
  selectedField,
  onSelectField,
  onDeleteField,
  updateRowColumns,
  deleteRow,
}: RowRendererProps) => {
  return (
    <div key={row.id} className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Grid2X2 className="h-4 w-4" />
          <span className="text-sm font-medium">Row {rowIndex + 1} - {row.columns} Column{row.columns > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Select 
            value={row.columns.toString()} 
            onValueChange={(value) => updateRowColumns(row.id, parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="6">6</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteRow(row.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Droppable droppableId={`row-${rowIndex}`} direction="horizontal">
        {(provided, snapshot) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            className={`grid gap-4 min-h-[120px] p-4 rounded ${
              snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : 'border-2 border-dashed border-gray-200'
            }`}
            style={{
              gridTemplateColumns: row.columns === 2 ? '1fr 1fr' : `repeat(${row.columns}, 1fr)`
            }}
          >
            {/* Create column placeholders */}
            {Array.from({ length: row.columns }).map((_, colIndex) => {
              const columnFields = rowFields.filter((_, fieldIndex) => fieldIndex % row.columns === colIndex);
              
              return (
                <div 
                  key={colIndex} 
                  className={`border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-[80px] ${
                    columnFields.length === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  {columnFields.length === 0 && (
                    <div className="text-center py-4 text-gray-400">
                      <Plus className="h-4 w-4 mx-auto mb-1" />
                      <p className="text-xs">Column {colIndex + 1}</p>
                    </div>
                  )}
                  
                  {columnFields.map((field) => (
                    <FieldRenderer
                      key={field.id}
                      field={field}
                      index={rowFields.indexOf(field)}
                      selectedField={selectedField}
                      onSelectField={onSelectField}
                      onDeleteField={onDeleteField}
                    />
                  ))}
                </div>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
