import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { FormBuilderHeader } from './FormBuilderHeader';
import { FieldTypesSidebar } from './FieldTypesSidebar';
import { FormCanvas } from './FormCanvas';
import { FormPreview } from './FormPreview';
import { FieldPropertiesSidebar } from './FieldPropertiesSidebar';
import { FormSettingsPanel } from './FormSettingsPanel';
import { useFormState } from '@/hooks/useFormState';
import { useFieldOperations } from '@/hooks/useFieldOperations';
import { useFormOperations } from '@/components/forms/FormOperations';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useRowManagement } from '@/hooks/useRowManagement';
import { generateThemeCSS } from '@/utils/themeUtils';

interface FormBuilderProps {
  formId?: string;
  onBack: () => void;
}

export const FormBuilder = ({ formId, onBack }: FormBuilderProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [settingsTab, setSettingsTab] = useState<'email' | 'styling' | 'embed'>('styling');
  const [saving, setSaving] = useState(false);

  const {
    form,
    setForm,
    fields,
    setFields,
    selectedField,
    setSelectedField,
    extractedThemes,
    handleThemeAdded,
    handleRemoveExtractedTheme,
  } = useFormState({ formId });

  const { addField, updateField, deleteField } = useFieldOperations({
    fields,
    setFields,
    setSelectedField,
    form,
  });

  const { saveForm, toggleFormStatus, copyEmbedCode, previewForm } = useFormOperations({
    formId,
    form,
    fields,
    setForm,
  });

  const { addNewRow } = useRowManagement({ form, setForm });

  const { onDragEnd } = useDragAndDrop({
    form,
    fields,
    setFields,
    setSelectedField,
    addField,
    addNewRow,
  });

  const handleSaveForm = async () => {
    setSaving(true);
    await saveForm();
    setSaving(false);
  };

  const handleImportFields = (importedFields: any[]) => {
    const currentPage = form?.layout_settings?.currentPage || 0;
    
    const newFields = importedFields.map((field, index) => ({
      id: `field_${Date.now()}_${index}`,
      field_type: field.field_type,
      label: field.label,
      placeholder: field.placeholder || '',
      required: field.required,
      options: field.options,
      position: fields.filter(f => (f.page || 0) === currentPage).length + index,
      page: currentPage,
    }));

    setFields([...fields, ...newFields]);
  };

  const selectedFieldData = fields.find(f => f.id === selectedField);

  return (
    <div className="h-full flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(form?.theme_settings || {}, form?.layout_settings) }} />
      
      <FormBuilderHeader
        onBack={onBack}
        form={form}
        onToggleFormStatus={toggleFormStatus}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onPreviewForm={previewForm}
        onCopyEmbedCode={copyEmbedCode}
        onSaveForm={handleSaveForm}
        saving={saving}
      />

      <div className="flex-1 flex">
        {!showSettings && (
          <DragDropContext onDragEnd={onDragEnd}>
            <FieldTypesSidebar 
              onAddField={addField} 
              form={form}
              onFormUpdate={setForm}
              onAddRow={addNewRow}
              onImportFields={handleImportFields}
            />
            <FormCanvas
              form={form}
              fields={fields}
              selectedField={selectedField}
              onDragEnd={onDragEnd}
              onSelectField={setSelectedField}
              onDeleteField={deleteField}
              onUpdateForm={setForm}
            />
            {showPreview && (
              <FormPreview form={form} fields={fields} />
            )}
            <FieldPropertiesSidebar
              selectedField={selectedFieldData}
              onUpdateField={updateField}
            />
          </DragDropContext>
        )}

        {showSettings && (
          <FormSettingsPanel
            form={form}
            fields={fields}
            settingsTab={settingsTab}
            onSettingsTabChange={setSettingsTab}
            onUpdateForm={setForm}
            extractedThemes={extractedThemes}
            onThemeAdded={handleThemeAdded}
            onRemoveExtractedTheme={handleRemoveExtractedTheme}
          />
        )}
      </div>
    </div>
  );
};
