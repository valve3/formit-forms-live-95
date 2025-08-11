
import { WebsiteFieldExtractor } from './WebsiteFieldExtractor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

interface ExtractedField {
  field_type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormFieldsImporterProps {
  onImportFields: (fields: ExtractedField[]) => void;
}

export const FormFieldsImporter = ({ onImportFields }: FormFieldsImporterProps) => {
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);

  const handleFieldsExtracted = (fields: ExtractedField[]) => {
    setExtractedFields(fields);
  };

  const removeField = (index: number) => {
    setExtractedFields(fields => fields.filter((_, i) => i !== index));
  };

  const importFields = () => {
    onImportFields(extractedFields);
    setExtractedFields([]);
  };

  return (
    <div className="space-y-6">
      <WebsiteFieldExtractor onFieldsExtracted={handleFieldsExtracted} />
      
      {extractedFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Fields ({extractedFields.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {extractedFields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline">{field.field_type}</Badge>
                      {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    </div>
                    <div className="font-medium">{field.label}</div>
                    {field.placeholder && (
                      <div className="text-sm text-gray-500">Placeholder: {field.placeholder}</div>
                    )}
                    {field.options && field.options.length > 0 && (
                      <div className="text-sm text-gray-500">
                        Options: {field.options.join(', ')}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Button onClick={importFields} className="w-full" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Import All Fields to Form
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
