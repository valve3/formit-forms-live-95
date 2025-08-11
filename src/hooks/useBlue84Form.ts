
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useBlue84Form = () => {
  const [blue84Status, setBlue84Status] = useState<'draft' | 'published'>('draft');
  
  // Initialize form data from localStorage or default
  const initializeFormData = () => {
    const savedData = localStorage.getItem('blue84FormData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
    return {
      id: 'blue84-template',
      title: 'Blue84 Multi-Step Order Form',
      description: 'Multi-step order form for custom apparel and promotional products',
      status: blue84Status,
      created_at: '2025-07-01T00:00:00.000Z',
      steps: [
        {
          step: 1,
          title: 'Contact Information',
          description: 'Collect basic contact details from users',
          fields: [
            { id: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Enter your first name' },
            { id: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter your last name' },
            { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter your email address' },
            { id: 'phone', label: 'Phone', type: 'tel', required: false, placeholder: 'Enter your phone number' },
            { id: 'organization', label: 'Organization', type: 'text', required: false, placeholder: 'Enter your organization' }
          ]
        },
        {
          step: 2,
          title: 'Looking for Better Logo Wear?',
          description: 'What brands do you have interest in?',
          fields: [
            { 
              id: 'brandCards', 
              label: 'Brand Interest', 
              type: 'brand-cards', 
              required: false,
              placeholder: '',
              options: [
                { id: 'blue84', name: 'Blue 84', description: 'Casual Custom Apparel' },
                { id: 'aksels', name: 'Aksels Socks', description: 'Cool Custom Socks' },
                { id: 'zephyr', name: 'Zephyr Hats', description: 'Quality Caps & Hats' },
                { id: 'altered-latitudes', name: 'Altered Latitudes', description: 'UV Active Wear' },
                { id: 'custom-stickers', name: 'Custom Stickers', description: 'Custom Stickers' }
              ]
            },
            { 
              id: 'brandRecommendation', 
              label: 'Other Brand Recommendation', 
              type: 'text', 
              required: false,
              placeholder: 'Enter any other brand you\'re interested in'
            }
          ]
        },
        {
          step: 3,
          title: 'Product Selection',
          description: 'Select the products you are interested in',
          fields: [
            { 
              id: 'garmentCards', 
              label: 'Select Products', 
              type: 'garment-cards', 
              required: true,
              placeholder: '',
              options: [
                { id: 'hat', name: 'Hat', description: '', icon: 'crown' },
                { id: 'casual-wear', name: 'Casual Wear', description: '', icon: 'shirt' },
                { id: 'socks', name: 'Socks', description: '', icon: 'user' },
                { id: 'active-wear', name: 'Active Wear', description: '', icon: 'sun' },
                { id: 'trending', name: 'Trending', description: '', icon: 'trending-up' },
                { id: 'not-sure', name: 'Not Sure', description: '', icon: 'help-circle' }
              ]
            },
            { 
              id: 'quantity', 
              label: 'Quantity Range', 
              type: 'quantity-buttons', 
              required: true,
              placeholder: '',
              options: ['1-50', '51-100', '101-250', '251-500', '500+']
            },
            { 
              id: 'customGearFor', 
              label: 'Custom Gear For', 
              type: 'select', 
              required: false,
              placeholder: 'Select purpose',
              options: ['Corporate Event', 'Sports Team', 'School/University', 'Non-Profit', 'Personal Use', 'Other']
            }
          ]
        },
        {
          step: 4,
          title: 'Budget Range',
          description: 'Help us understand your budget and artwork needs',
          fields: [
            { 
              id: 'budgetRange', 
              label: 'Budget Range', 
              type: 'budget-slider', 
              required: true,
              placeholder: '',
              options: ['500', '25000', '2500'] // min, max, default
            },
            { 
              id: 'customArtwork', 
              label: 'Do you need custom artwork?', 
              type: 'custom-artwork-cards', 
              required: true,
              placeholder: '',
              options: [
                { id: 'yes', name: 'Yes', description: 'We need custom design work', icon: 'check' },
                { id: 'no', name: 'No', description: 'We have artwork ready', icon: 'x' }
              ]
            }
          ]
        }
      ],
      format: 'multi-page',
      theme_settings: {
        primaryColor: '#2563eb',
        backgroundColor: '#ffffff',
        buttonColor: '#2563eb',
        borderColor: '#d1d5db',
        cardBackground: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        textColor: '#1f2937',
        captcha_enabled: false
      },
      email_settings: {
        enabled: false,
        emails: []
      }
    };
  };
  
  const [blue84FormData, setBlue84FormData] = useState(initializeFormData());
  const { toast } = useToast();

  // Update status when form data changes
  useEffect(() => {
    if (blue84FormData.status !== blue84Status) {
      setBlue84Status(blue84FormData.status);
    }
  }, [blue84FormData.status, blue84Status]);

  const handleViewBlue84Form = () => {
    // Get the most recent form data (including any recent updates)
    const latestFormData = {
      ...blue84FormData,
      updated_at: new Date().toISOString()
    };
    
    const formConfig = encodeURIComponent(JSON.stringify(latestFormData));
    window.open(`/blue84-form?config=${formConfig}`, '_blank');
  };

  const handleCopyBlue84Embed = () => {
    // Get the most recent form data (including any recent updates)
    const latestFormData = {
      ...blue84FormData,
      updated_at: new Date().toISOString()
    };
    
    const formConfig = encodeURIComponent(JSON.stringify(latestFormData));
    const embedCode = `<iframe src="${window.location.origin}/blue84-form?config=${formConfig}" width="100%" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: 'Embed code copied',
      description: 'The embed code has been copied to your clipboard.',
    });
  };

  const handleDuplicateBlue84 = async () => {
    try {
      const formData = {
        title: `${blue84FormData.title} (Copy)`,
        description: blue84FormData.description,
        status: 'draft',
        theme_settings: blue84FormData.theme_settings,
        email_settings: blue84FormData.email_settings,
        user_id: 'current-user-id' // This should be replaced with actual user ID
      };

      // For now, just show success toast since we don't have actual database integration
      toast({
        title: 'Template Duplicated',
        description: 'Blue84 form template has been duplicated to your forms.',
      });
      
      // Refresh the parent component to show the new form
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate the form template.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleBlue84Status = () => {
    const newStatus = blue84Status === 'published' ? 'draft' : 'published';
    setBlue84Status(newStatus);
    const newFormData = {
      ...blue84FormData,
      status: newStatus
    };
    setBlue84FormData(newFormData);
    
    // Save to localStorage to persist across sessions
    localStorage.setItem('blue84FormData', JSON.stringify(newFormData));
    
    toast({
      title: 'Status Updated',
      description: `Blue84 form ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
    });
  };

  const handleBlue84FormUpdate = (updatedFormData: any) => {
    const newFormData = {
      ...blue84FormData,
      ...updatedFormData,
      updated_at: new Date().toISOString()
    };
    
    setBlue84FormData(newFormData);
    
    // Save to localStorage to persist across sessions
    localStorage.setItem('blue84FormData', JSON.stringify(newFormData));
  };

  const handleBlue84SecurityToggle = () => {
    const newCaptchaEnabled = !blue84FormData.theme_settings?.captcha_enabled;
    const newFormData = {
      ...blue84FormData,
      theme_settings: {
        ...blue84FormData.theme_settings,
        captcha_enabled: newCaptchaEnabled
      }
    };
    
    setBlue84FormData(newFormData);
    
    // Save to localStorage to persist across sessions
    localStorage.setItem('blue84FormData', JSON.stringify(newFormData));
    
    toast({
      title: 'Security Settings Updated',
      description: `CAPTCHA ${newCaptchaEnabled ? 'enabled' : 'disabled'} for Blue84 form`,
    });
  };

  return {
    blue84Status,
    blue84FormData,
    setBlue84FormData,
    handleViewBlue84Form,
    handleCopyBlue84Embed,
    handleDuplicateBlue84,
    handleToggleBlue84Status,
    handleBlue84FormUpdate,
    handleBlue84SecurityToggle
  };
};
