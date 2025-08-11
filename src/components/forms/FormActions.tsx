
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2, Copy, Code } from 'lucide-react';

interface FormActionsProps {
  onEdit: () => void;
  onPreview: () => void;
  onCopyEmbed: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  loading: boolean;
}

export const FormActions = ({ 
  onEdit, 
  onPreview, 
  onCopyEmbed, 
  onDuplicate, 
  onDelete, 
  loading 
}: FormActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        disabled={loading}
      >
        <Edit className="h-4 w-4 mr-1" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onPreview}
        disabled={loading}
      >
        <Eye className="h-4 w-4 mr-1" />
        Preview
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onCopyEmbed}
        disabled={loading}
      >
        <Code className="h-4 w-4 mr-1" />
        Embed
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDuplicate}
        disabled={loading}
      >
        <Copy className="h-4 w-4 mr-1" />
        Duplicate
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="text-red-600 hover:text-red-700"
        disabled={loading}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
};
