
import { useEffect, useState } from 'react';
import { Blue84OrderForm } from '@/components/forms/Blue84OrderForm';
import { Blue84DynamicForm } from '@/components/forms/Blue84DynamicForm';

const Blue84Form = () => {
  const [formConfig, setFormConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a config parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    
    if (configParam) {
      try {
        const decodedConfig = JSON.parse(decodeURIComponent(configParam));
        setFormConfig(decodedConfig);
      } catch (error) {
        console.error('Error parsing form config:', error);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {formConfig && formConfig.steps ? (
          <Blue84DynamicForm 
            steps={formConfig.steps}
            formSettings={formConfig.theme_settings || {}}
            format={formConfig.format || 'multi-page'}
          />
        ) : (
          <Blue84OrderForm />
        )}
      </div>
    </div>
  );
};

export default Blue84Form;
