
interface ThemeSettings {
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  buttonColor?: string;
  primaryColor?: string;
}

interface FormStylePreviewProps {
  themeSettings: ThemeSettings;
}

export const FormStylePreview = ({ themeSettings }: FormStylePreviewProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Preview</h3>
      <div 
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: themeSettings.backgroundColor || '#ffffff',
          color: themeSettings.textColor || '#1f2937',
          fontFamily: themeSettings.fontFamily || 'Inter, sans-serif',
        }}
      >
        <h4 className="text-lg font-semibold mb-2">Sample Form</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <div className="w-full h-8 bg-gray-100 rounded border"></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="w-full h-8 bg-gray-100 rounded border"></div>
          </div>
          <button
            className="px-4 py-2 rounded text-white font-medium"
            style={{
              backgroundColor: themeSettings.buttonColor || themeSettings.primaryColor || '#3b82f6'
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
