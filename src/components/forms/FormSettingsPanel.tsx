
import { EmailSettings } from './EmailSettings';
import { EmbedCode } from './EmbedCode';
import { FormStyling } from './FormStyling';
import { FormPreview } from './FormPreview';

interface FormField {
  id: string;
  field_type: any;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  position: number;
}

interface FormSettingsPanelProps {
  form: any;
  fields: FormField[];
  settingsTab: 'email' | 'styling' | 'embed';
  onSettingsTabChange: (tab: 'email' | 'styling' | 'embed') => void;
  onUpdateForm: (updates: any) => void;
  extractedThemes: any[];
  onThemeAdded: (theme: any) => void;
  onRemoveExtractedTheme: (themeId: string) => void;
}

export const FormSettingsPanel = ({
  form,
  fields,
  settingsTab,
  onSettingsTabChange,
  onUpdateForm,
  extractedThemes,
  onThemeAdded,
  onRemoveExtractedTheme,
}: FormSettingsPanelProps) => {
  return (
    <div className="flex-1 flex">
      {/* Settings Panel */}
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">Form Settings</h2>
          
          {/* Settings Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => onSettingsTabChange('styling')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                settingsTab === 'styling'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Styling
            </button>
            <button
              onClick={() => onSettingsTabChange('email')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                settingsTab === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Email Settings
            </button>
            <button
              onClick={() => onSettingsTabChange('embed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                settingsTab === 'embed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Embed Code
            </button>
          </div>

          {/* Settings Content */}
          {settingsTab === 'styling' && (
            <FormStyling
              themeSettings={form?.theme_settings}
              layoutSettings={form?.layout_settings}
              onThemeUpdate={(settings) => onUpdateForm({ ...form, theme_settings: settings })}
              onLayoutUpdate={(settings) => onUpdateForm({ ...form, layout_settings: settings })}
              extractedThemes={extractedThemes}
              onThemeAdded={onThemeAdded}
              onRemoveExtractedTheme={onRemoveExtractedTheme}
            />
          )}

          {settingsTab === 'email' && (
            <EmailSettings
              emailSettings={form?.email_settings}
              onUpdate={(settings) => onUpdateForm({ ...form, email_settings: settings })}
            />
          )}

          {settingsTab === 'embed' && form?.id && (
            <EmbedCode formId={form.id} formTitle={form?.title || 'Untitled Form'} />
          )}
        </div>
      </div>

      {/* Live Preview Panel in Settings */}
      <FormPreview form={form} fields={fields} />
    </div>
  );
};
