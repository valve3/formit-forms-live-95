
import { ThemePreset } from '@/types/theme';

interface ThemePreviewProps {
  theme: ThemePreset;
}

export const ThemePreview = ({ theme }: ThemePreviewProps) => {
  const logoSettings = theme.logoSettings || {
    position: 'center',
    maxWidth: 200,
    maxHeight: 80,
    marginBottom: 24
  };

  const getLogoAlignment = () => {
    switch (logoSettings.position) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'center':
      default:
        return 'center';
    }
  };

  return (
    <div className="w-80 border-l pl-6">
      <h3 className="font-medium mb-4">Preview</h3>
      <div
        className="p-4 rounded border"
        style={{
          backgroundColor: theme.theme.backgroundColor,
          maxWidth: `${Math.min(theme.theme.maxWidth || 600, 300)}px`,
          fontFamily: theme.theme.fontFamily,
          fontSize: `${(theme.theme.fontSize || 14) - 2}px`,
        }}
      >
        {theme.logo && (
          <div 
            className="flex"
            style={{ 
              justifyContent: getLogoAlignment(),
              marginBottom: `${Math.round(logoSettings.marginBottom * 0.5)}px`
            }}
          >
            <img
              src={theme.logo.url}
              alt="Logo"
              style={{
                maxWidth: `${Math.round(logoSettings.maxWidth * 0.7)}px`,
                maxHeight: `${Math.round(logoSettings.maxHeight * 0.7)}px`,
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        <div
          className="mb-3 font-medium"
          style={{ color: theme.theme.textColor }}
        >
          {theme.name || 'New Theme'}
        </div>
        <div
          className="w-full h-8 mb-3 rounded border"
          style={{
            backgroundColor: theme.theme.cardBackground || '#ffffff',
            borderColor: theme.theme.borderColor,
            borderRadius: `${Math.max(4, (theme.theme.borderRadius || 8) - 2)}px`,
          }}
        />
        <button
          className="px-4 py-2 rounded font-medium"
          style={{
            backgroundColor: theme.theme.buttonColor,
            color: theme.theme.buttonTextColor,
            borderRadius: `${Math.max(4, (theme.theme.borderRadius || 8) - 2)}px`,
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};
