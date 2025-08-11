
import { Database } from '@/integrations/supabase/types';

type FieldType = Database['public']['Enums']['field_type'];

interface FormField {
  id: string;
  field_type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  position: number;
  page?: number;
  row?: number;
}

interface UseDragAndDropProps {
  form: any;
  fields: FormField[];
  setFields: (fields: FormField[]) => void;
  setSelectedField: (fieldId: string | null) => void;
  addField: (fieldType: FieldType) => void;
  addNewRow?: (columns: number) => void;
}

export const useDragAndDrop = ({
  form,
  fields,
  setFields,
  setSelectedField,
  addField,
  addNewRow,
}: UseDragAndDropProps) => {

  const onDragEnd = (result: any) => {
    console.log('Drag result:', result);
    
    if (!result.destination) {
      console.log('No destination, canceling drag');
      return;
    }

    const { source, destination, draggableId } = result;
    
    // Handle dragging layout controls from sidebar
    if (source.droppableId === 'layout-controls-sidebar') {
      console.log('Dragging layout control:', draggableId);
      
      // Parse the draggableId to get the number of columns
      const match = draggableId.match(/layout-(\d+)-columns/);
      if (!match) {
        console.log('Could not parse columns from draggableId:', draggableId);
        return;
      }
      
      const columns = parseInt(match[1]);
      console.log('Parsed columns:', columns);
      
      // Only allow dropping layout controls into main-form area
      if (destination.droppableId === 'main-form') {
        console.log('Dropping layout control into main form with', columns, 'columns');
        if (addNewRow) {
          addNewRow(columns);
        } else {
          console.log('addNewRow function not available');
        }
      } else {
        console.log('Invalid drop target for layout control:', destination.droppableId);
      }
      return;
    }
    
    // Handle dragging from sidebar (field types)
    if (source.droppableId === 'field-types-sidebar') {
      const fieldType = draggableId.replace('field-type-', '') as FieldType;
      console.log('Adding field type:', fieldType, 'to destination:', destination.droppableId);
      
      const currentPage = form?.layout_settings?.currentPage || 0;
      
      // Dropping into a row
      if (destination.droppableId.startsWith('row-')) {
        const rowIndex = parseInt(destination.droppableId.replace('row-', ''));
        
        const newField: FormField = {
          id: `field_${Date.now()}`,
          field_type: fieldType,
          label: `New ${fieldType} field`,
          placeholder: '',
          required: false,
          position: destination.index,
          page: currentPage,
          row: rowIndex,
        };

        if (['select', 'radio', 'checkbox'].includes(fieldType)) {
          newField.options = ['Option 1', 'Option 2'];
        }

        console.log('Creating new field for row:', newField);
        setFields([...fields, newField]);
        setSelectedField(newField.id);
        return;
      }
      
      // Dropping into main form area
      if (destination.droppableId === 'main-form') {
        console.log('Adding field to main form area');
        addField(fieldType);
        return;
      }
    }

    // Handle moving existing fields
    const currentPage = form?.layout_settings?.currentPage || 0;
    
    // Check if we're moving an existing field
    const existingField = fields.find(f => f.id === draggableId);
    if (!existingField) {
      console.log('Field not found:', draggableId);
      return;
    }
    
    // Moving field to a row
    if (destination.droppableId.startsWith('row-')) {
      const rowIndex = parseInt(destination.droppableId.replace('row-', ''));
      console.log('Moving field to row:', rowIndex);
      
      const updatedFields = fields.map(field => 
        field.id === draggableId 
          ? { ...field, row: rowIndex, page: currentPage, position: destination.index }
          : field
      );
      setFields(updatedFields);
      return;
    }

    // Moving field to main form (removing from row)
    if (destination.droppableId === 'main-form') {
      console.log('Moving field to main form');
      
      const updatedFields = fields.map(field => 
        field.id === draggableId 
          ? { ...field, row: undefined, page: currentPage, position: destination.index }
          : field
      );
      setFields(updatedFields);
      return;
    }

    // Handle reordering within the same container
    const sourceContainer = source.droppableId;
    const destContainer = destination.droppableId;
    
    if (sourceContainer === destContainer) {
      let containerFields: FormField[] = [];
      
      if (sourceContainer === 'main-form') {
        containerFields = fields.filter(f => 
          (f.page || 0) === currentPage && (f.row === undefined || f.row === null)
        );
      } else if (sourceContainer.startsWith('row-')) {
        const rowIndex = parseInt(sourceContainer.replace('row-', ''));
        containerFields = fields.filter(f => 
          (f.page || 0) === currentPage && f.row === rowIndex
        );
      }
      
      const reorderedFields = Array.from(containerFields);
      const [reorderedField] = reorderedFields.splice(source.index, 1);
      reorderedFields.splice(destination.index, 0, reorderedField);
      
      // Update positions for reordered fields
      const updatedFields = fields.map(field => {
        const reorderedIndex = reorderedFields.findIndex(f => f.id === field.id);
        if (reorderedIndex !== -1) {
          return { ...field, position: reorderedIndex };
        }
        return field;
      });
      
      setFields(updatedFields);
    }
  };

  return { onDragEnd };
};
