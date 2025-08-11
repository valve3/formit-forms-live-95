
import { Button } from '@/components/ui/button';
import { Plus, Copy } from 'lucide-react';

interface FormsListHeaderProps {
  onCreateForm: () => void;
  onCloneForm: () => void;
}

export const FormsListHeader = ({ onCreateForm, onCloneForm }: FormsListHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Forms</h2>
        <p className="text-gray-600">Create and manage your forms</p>
      </div>
      <div className="flex space-x-3">
        <Button onClick={onCloneForm} variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          Clone Form
        </Button>
        <Button onClick={onCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Create Form
        </Button>
      </div>
    </div>
  );
};
