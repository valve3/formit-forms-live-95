
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RowRenderer } from './canvas/RowRenderer';
import { MainDropZone } from './canvas/MainDropZone';
import { PageNavigation } from './canvas/PageNavigation';

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

interface FormCanvasProps {
  form: any;
  fields: FormField[];
  selectedField: string | null;
  onDragEnd: (result: any) => void;
  onSelectField: (fieldId: string) => void;
  onDeleteField: (fieldId: string) => void;
  onUpdateForm: (updates: any) => void;
}

export const FormCanvas = ({
  form,
  fields,
  selectedField,
  onDragEnd,
  onSelectField,
  onDeleteField,
  onUpdateForm,
}: FormCanvasProps) => {
  const layoutSettings = form?.layout_settings || { 
    pages: [{ id: 'page_1', title: 'Page 1', columns: 1, rows: [] }], 
    currentPage: 0 
  };
  const currentPage = layoutSettings.currentPage || 0;
  const currentPageSettings = layoutSettings.pages?.[currentPage] || { 
    id: 'page_1', 
    title: 'Page 1', 
    columns: 1,
    rows: []
  };
  
  // Filter fields for current page
  const currentPageFields = fields.filter(field => (field.page || 0) === currentPage);

  // Group fields by rows
  const rows = currentPageSettings.rows || [];
  const fieldsWithoutRows = currentPageFields.filter(field => field.row === undefined || field.row === null);

  const updateRowColumns = (rowId: string, columns: number) => {
    const updatedRows = rows.map(row => 
      row.id === rowId ? { ...row, columns } : row
    );
    
    const updatedPageSettings = {
      ...currentPageSettings,
      rows: updatedRows
    };
    
    const updatedLayoutSettings = {
      ...layoutSettings,
      pages: layoutSettings.pages.map((page, index) => 
        index === currentPage ? updatedPageSettings : page
      )
    };
    
    onUpdateForm({
      ...form,
      layout_settings: updatedLayoutSettings
    });
  };

  const deleteRow = (rowId: string) => {
    const updatedRows = rows.filter(row => row.id !== rowId);
    const updatedPageSettings = {
      ...currentPageSettings,
      rows: updatedRows
    };
    
    const updatedLayoutSettings = {
      ...layoutSettings,
      pages: layoutSettings.pages.map((page, index) => 
        index === currentPage ? updatedPageSettings : page
      )
    };
    
    onUpdateForm({
      ...form,
      layout_settings: updatedLayoutSettings
    });
  };

  const setCurrentPage = (pageIndex: number) => {
    const updatedLayoutSettings = {
      ...layoutSettings,
      currentPage: pageIndex
    };
    onUpdateForm({
      ...form,
      layout_settings: updatedLayoutSettings
    });
  };

  // Get logo settings from theme if available
  const logoSettings = form?.theme_settings?.logoSettings || {
    position: 'center',
    maxWidth: 200,
    maxHeight: 80,
    marginBottom: 24
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="space-y-4">
            {form?.theme_settings?.logo && (
              <div 
                className="flex"
                style={{
                  justifyContent: logoSettings.position === 'left' ? 'flex-start' : logoSettings.position === 'right' ? 'flex-end' : 'center',
                  marginBottom: `${Math.round(logoSettings.marginBottom * 0.7)}px`
                }}
              >
                <img
                  src={form.theme_settings.logo.url}
                  alt="Logo"
                  style={{
                    maxWidth: `${Math.round(logoSettings.maxWidth * 0.7)}px`,
                    maxHeight: `${Math.round(logoSettings.maxHeight * 0.7)}px`,
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}
            <div>
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={form?.title || ''}
                onChange={(e) => onUpdateForm({ ...form, title: e.target.value })}
                placeholder="Enter form title"
                className="text-xl font-semibold"
              />
            </div>
            <div>
              <Label htmlFor="form-description">Form Description</Label>
              <Textarea
                id="form-description"
                value={form?.description || ''}
                onChange={(e) => onUpdateForm({ ...form, description: e.target.value })}
                placeholder="Enter form description (optional)"
                rows={3}
              />
            </div>

            <PageNavigation
              layoutSettings={layoutSettings}
              currentPage={currentPage}
              currentPageSettings={currentPageSettings}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Render Rows */}
            {rows.map((row, rowIndex) => {
              const rowFields = currentPageFields.filter(field => field.row === rowIndex);
              
              return (
                <RowRenderer
                  key={row.id}
                  row={row}
                  rowIndex={rowIndex}
                  rowFields={rowFields}
                  selectedField={selectedField}
                  onSelectField={onSelectField}
                  onDeleteField={onDeleteField}
                  updateRowColumns={updateRowColumns}
                  deleteRow={deleteRow}
                />
              );
            })}

            {/* Main Drop Zone for Unassigned Fields */}
            <MainDropZone
              fieldsWithoutRows={fieldsWithoutRows}
              selectedField={selectedField}
              onSelectField={onSelectField}
              onDeleteField={onDeleteField}
              rowsCount={rows.length}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
