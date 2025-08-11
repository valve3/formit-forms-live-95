
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText } from 'lucide-react';

interface EmptyFormsStateProps {
  onCreateForm: () => void;
}

export const EmptyFormsState = ({ onCreateForm }: EmptyFormsStateProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
        <p className="text-gray-600 text-center mb-4">
          Get started by creating your first form
        </p>
        <Button onClick={onCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Form
        </Button>
      </CardContent>
    </Card>
  );
};
