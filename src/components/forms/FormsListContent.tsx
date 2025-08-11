
import { FormCard } from './FormCard';
import { EmptyFormsState } from './EmptyFormsState';
import { Blue84FormCard } from './Blue84FormCard';

interface Form {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  embed_code: string;
}

interface Blue84FormData {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  created_at: string;
  theme_settings: {
    primaryColor: string;
    backgroundColor: string;
    buttonColor: string;
    borderColor: string;
    cardBackground: string;
    fontFamily: string;
    textColor: string;
    captcha_enabled?: boolean;
  };
  email_settings: {
    enabled: boolean;
    emails: string[];
  };
}

interface FormsListContentProps {
  forms: Form[];
  blue84FormData: Blue84FormData;
  blue84Status: 'draft' | 'published';
  onCreateForm: () => void;
  onEditForm: (formId: string) => void;
  onRefresh: () => void;
  onEditBlue84Form: () => void;
  onViewBlue84Form: () => void;
  onCopyBlue84Embed: () => void;
  onDuplicateBlue84: () => void;
  onToggleBlue84Status: () => void;
  onBlue84SecurityToggle: () => void;
}

export const FormsListContent = ({
  forms,
  blue84FormData,
  blue84Status,
  onCreateForm,
  onEditForm,
  onRefresh,
  onEditBlue84Form,
  onViewBlue84Form,
  onCopyBlue84Embed,
  onDuplicateBlue84,
  onToggleBlue84Status,
  onBlue84SecurityToggle
}: FormsListContentProps) => {
  if (forms.length === 0) {
    return (
      <div className="space-y-6">
        <Blue84FormCard
          blue84FormData={blue84FormData}
          blue84Status={blue84Status}
          onEditBlue84Form={onEditBlue84Form}
          onViewBlue84Form={onViewBlue84Form}
          onCopyBlue84Embed={onCopyBlue84Embed}
          onDuplicateBlue84={onDuplicateBlue84}
          onToggleBlue84Status={onToggleBlue84Status}
          onBlue84SecurityToggle={onBlue84SecurityToggle}
        />
        <EmptyFormsState onCreateForm={onCreateForm} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Blue84FormCard
        blue84FormData={blue84FormData}
        blue84Status={blue84Status}
        onEditBlue84Form={onEditBlue84Form}
        onViewBlue84Form={onViewBlue84Form}
        onCopyBlue84Embed={onCopyBlue84Embed}
        onDuplicateBlue84={onDuplicateBlue84}
        onToggleBlue84Status={onToggleBlue84Status}
        onBlue84SecurityToggle={onBlue84SecurityToggle}
      />
      
      {/* Regular Forms */}
      {forms.map((form) => (
        <FormCard
          key={form.id}
          form={form}
          onEditForm={onEditForm}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};
