
import { useState } from 'react';
import { Blue84FormEditor } from './Blue84FormEditor';
import { FormsListHeader } from './FormsListHeader';
import { FormsListContent } from './FormsListContent';
import { FormCloner } from './FormCloner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFormsList } from '@/hooks/useFormsList';
import { useBlue84Form } from '@/hooks/useBlue84Form';

interface FormsListProps {
  onCreateForm: () => void;
  onEditForm: (formId: string) => void;
}

export const FormsList = ({ onCreateForm, onEditForm }: FormsListProps) => {
  const [showBlue84Editor, setShowBlue84Editor] = useState(false);
  const [showFormCloner, setShowFormCloner] = useState(false);
  const { forms, loading, fetchForms } = useFormsList();
  const {
    blue84Status,
    blue84FormData,
    handleViewBlue84Form,
    handleCopyBlue84Embed,
    handleDuplicateBlue84,
    handleToggleBlue84Status,
    handleBlue84FormUpdate,
    handleBlue84SecurityToggle
  } = useBlue84Form();

  const handleEditBlue84Form = () => {
    setShowBlue84Editor(true);
  };

  const handleCloneForm = () => {
    setShowFormCloner(true);
  };

  const handleFormCloned = (formId: string) => {
    setShowFormCloner(false);
    fetchForms(); // Refresh the forms list
    onEditForm(formId); // Navigate to the new form
  };

  if (showBlue84Editor) {
    return (
      <Blue84FormEditor 
        onFormUpdate={handleBlue84FormUpdate}
        onClose={() => setShowBlue84Editor(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <FormsListHeader 
        onCreateForm={onCreateForm} 
        onCloneForm={handleCloneForm}
      />
      <FormsListContent
        forms={forms}
        blue84FormData={blue84FormData}
        blue84Status={blue84Status}
        onCreateForm={onCreateForm}
        onEditForm={onEditForm}
        onRefresh={fetchForms}
        onEditBlue84Form={handleEditBlue84Form}
        onViewBlue84Form={handleViewBlue84Form}
        onCopyBlue84Embed={handleCopyBlue84Embed}
        onDuplicateBlue84={handleDuplicateBlue84}
        onToggleBlue84Status={handleToggleBlue84Status}
        onBlue84SecurityToggle={handleBlue84SecurityToggle}
      />
      
      <Dialog open={showFormCloner} onOpenChange={setShowFormCloner}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clone Form from Website</DialogTitle>
          </DialogHeader>
          <FormCloner onFormCloned={handleFormCloned} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
