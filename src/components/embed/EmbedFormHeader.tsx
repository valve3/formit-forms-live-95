
import React from 'react';

interface LogoSettings {
  position: 'left' | 'center' | 'right';
  maxWidth: number;
  maxHeight: number;
  marginBottom: number;
}

interface LogoData {
  url: string;
  name: string;
  size: number;
}

interface EmbedFormHeaderProps {
  title: string;
  description?: string;
  logo?: LogoData | null;
  logoSettings?: LogoSettings;
}

const EmbedFormHeader: React.FC<EmbedFormHeaderProps> = ({
  title,
  description,
  logo,
  logoSettings
}) => {
  const defaultLogoSettings = {
    position: 'center' as const,
    maxWidth: 200,
    maxHeight: 80,
    marginBottom: 24
  };

  const settings = logoSettings || defaultLogoSettings;

  return (
    <>
      {logo && (
        <div 
          className={`themed-form-logo-container themed-form-logo-${settings.position}`}
          style={{ marginBottom: `${settings.marginBottom}px` }}
        >
          <img
            src={logo.url}
            alt="Logo"
            className="themed-form-logo"
            style={{
              maxWidth: `${settings.maxWidth}px`,
              maxHeight: `${settings.maxHeight}px`
            }}
          />
        </div>
      )}
      <div className="mb-6">
        <h1 className="themed-form-title">{title}</h1>
        {description && (
          <p className="themed-form-description">{description}</p>
        )}
      </div>
    </>
  );
};

export default EmbedFormHeader;
