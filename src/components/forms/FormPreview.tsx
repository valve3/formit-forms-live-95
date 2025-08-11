
import { Eye, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface FormField {
  id: string;
  field_type: any;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  position: number;
  page?: number;
}

interface FormPreviewProps {
  form: any;
  fields: FormField[];
}

export const FormPreview = ({ form, fields }: FormPreviewProps) => {
  const layoutSettings = form?.layout_settings || { pages: [{ id: 'page_1', title: 'Page 1', columns: 1 }], currentPage: 0 };
  const currentPage = layoutSettings.currentPage || 0;
  const currentPageSettings = layoutSettings.pages?.[currentPage] || { id: 'page_1', title: 'Page 1', columns: 1 };
  
  // Filter fields for current page
  const currentPageFields = fields.filter(field => (field.page || 0) === currentPage);

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

  // Get logo settings from theme if available
  const logoSettings = form?.theme_settings?.logoSettings || {
    position: 'center',
    maxWidth: 200,
    maxHeight: 80,
    marginBottom: 24
  };

  // Generate grid CSS based on current page settings
  const getGridStyle = () => {
    if (currentPageSettings.columns > 1) {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${currentPageSettings.columns}, 1fr)`,
        gap: `${currentPageSettings.rowGap || 16}px ${currentPageSettings.columnGap || 16}px`
      };
    }
    return {};
  };

  return (
    <div className="w-96 bg-gray-50 border-l overflow-y-auto">
      <div className="p-4 border-b bg-white">
        <h3 className="font-medium text-gray-900 flex items-center">
          <Eye className="h-4 w-4 mr-2" />
          Live Preview
        </h3>
        {layoutSettings.pages && layoutSettings.pages.length > 1 && (
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Page {currentPage + 1} of {layoutSettings.pages.length}</span>
            <span>{currentPageSettings.title}</span>
          </div>
        )}
      </div>
      <div className="preview-form-container min-h-full">
        <div className="preview-form-card">
          {form?.theme_settings?.logo && (
            <div 
              className={`flex mb-6`}
              style={{
                justifyContent: logoSettings.position === 'left' ? 'flex-start' : logoSettings.position === 'right' ? 'flex-end' : 'center',
                marginBottom: `${Math.round(logoSettings.marginBottom * 0.8)}px`
              }}
            >
              <img
                src={form.theme_settings.logo.url}
                alt="Logo"
                style={{
                  maxWidth: `${Math.round(logoSettings.maxWidth * 0.8)}px`,
                  maxHeight: `${Math.round(logoSettings.maxHeight * 0.8)}px`,
                  objectFit: 'contain'
                }}
              />
            </div>
          )}
          <div className="mb-6">
            <h1 className="preview-form-title font-bold mb-2">{form?.title || 'Untitled Form'}</h1>
            {form?.description && (
              <p className="preview-form-description">{form.description}</p>
            )}
          </div>

          {/* Page Navigation for Multi-page Forms */}
          {layoutSettings.pages && layoutSettings.pages.length > 1 && (
            <div className="mb-6 p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{currentPageSettings.title}</span>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <form>
            <div 
              style={getGridStyle()}
              className={currentPageSettings.columns <= 1 ? 'space-y-4' : ''}
            >
              {currentPageFields.map((field) => (
                <div key={field.id}>
                  <label className="preview-form-label block mb-2 font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderFieldPreview(field)}
                </div>
              ))}
            </div>
            <button 
              type="button"
              className={`preview-form-button mt-6 px-6 py-3 rounded font-medium w-full ${
                currentPageSettings.columns > 1 ? 'preview-form-submit-button' : ''
              }`}
            >
              {layoutSettings.pages && layoutSettings.pages.length > 1 && currentPage < layoutSettings.pages.length - 1 
                ? 'Next Page' 
                : 'Submit Form'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
