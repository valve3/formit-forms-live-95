
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, Eye, Settings, Save, ArrowLeft, Upload, X } from 'lucide-react';
import { Blue84StepEditor } from './Blue84StepEditor';
import { Blue84DynamicForm } from './Blue84DynamicForm';
import { FormEmailSettings } from './FormEmailSettings';
import { useToast } from '@/hooks/use-toast';
import { useBlue84Form } from '@/hooks/useBlue84Form';

interface FormData {
  // Contact Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  
  // Logo Requirements
  hasLogo: boolean;
  logoType: string;
  logoFile?: File;
  
  // Product Selection
  productTypes: string[];
  
  // Quantities
  quantity: string;
  
  // Budget
  budgetRange: string;
  
  // Custom Artwork
  needsCustomArtwork: boolean;
  artworkDescription: string;
}

interface FormSettings {
  brandLogos: Record<string, string>;
  productImages: Record<string, string>;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    logo?: string;
  };
}

interface FormStep {
  step: number;
  title: string;
  description?: string;
  fields: any[];
  imageOptions?: Array<{
    key: string;
    label: string;
    image?: string;
  }>;
}

const initialSteps: FormStep[] = [
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
      },
      { 
        id: 'garmentType', 
        label: 'Why Type of Garment Are You Looking For', 
        type: 'garment-cards', 
        required: false,
        placeholder: '',
        options: [
          { id: 'hat', name: 'Hat', icon: 'hat' },
          { id: 'casual-wear', name: 'Casual Wear', icon: 'shirt' },
          { id: 'socks', name: 'Socks', icon: 'socks' }
        ]
      }
    ],
    imageOptions: [
      { key: 'blue84', label: 'Blue 84 Logo', image: '' },
      { key: 'aksels', label: 'Aksels Logo', image: '' },
      { key: 'zephyr', label: 'Zephyr Logo', image: '' },
      { key: 'altered-latitudes', label: 'Altered Latitudes Logo', image: '' },
      { key: 'custom-stickers', label: 'Custom Stickers Logo', image: '' }
    ]
  },
  {
    step: 3,
    title: 'Product Selection',
    description: 'What type of apparel are you looking for?',
    fields: [
      { 
        id: 'productTypes', 
        label: 'Why Type of Garment Are You Looking For', 
        type: 'garment-cards', 
        required: false,
        placeholder: '',
        options: [
          { id: 'hat', name: 'Hat', icon: 'hat' },
          { id: 'casual-wear', name: 'Casual Wear', icon: 'shirt' },
          { id: 'socks', name: 'Socks', icon: 'socks' },
          { id: 'active-wear', name: 'Active Wear', icon: 'sun' },
          { id: 'trending', name: 'Trending', icon: 'trending-up' },
          { id: 'not-sure', name: 'Not Sure', icon: 'help-circle' }
        ]
      },
      { 
        id: 'quantity', 
        label: 'What Quantity Are You Looking For?', 
        type: 'quantity-buttons', 
        required: false,
        options: ['48-100', '101-200', '200+']
      },
      { 
        id: 'customGearFor', 
        label: 'Who is This Custom Gear For?', 
        type: 'select', 
        required: false,
        placeholder: 'Please select',
        options: ['Corporate Event', 'Team Uniforms', 'Promotional Items', 'Retail Merchandise', 'Sports Team', 'School/University', 'Non-Profit Organization', 'Other']
      }
    ]
  },
  {
    step: 4,
    title: 'Budget Range',
    description: '48 unit minimum, mixing 12 per garment / color to hit 48. Graphic size / color must stay the same.',
    fields: [
      { 
        id: 'budget', 
        label: 'Budget', 
        type: 'budget-slider', 
        required: false,
        placeholder: '$2,500',
        options: ['500', '25000', '2500'] // [min, max, default]
      },
      { 
        id: 'needsCustomArtwork', 
        label: 'Do You Need Custom Artwork?', 
        type: 'custom-artwork-cards', 
        required: false,
        description: 'If you partner with us, with over 140 artist on staff we offer simple logo and color changes all the way to complete rebranding. Free of charge for partners of all our brands.',
        options: [
          { id: 'yes', name: 'Yes', icon: 'check' },
          { id: 'no', name: 'No', icon: 'x' }
        ]
      }
    ]
  }
];

const initialFormSettings: FormSettings = {
  brandLogos: {
    Nike: '',
    Adidas: '',
    Callaway: ''
  },
  productImages: {
    hat: '',
    'casual-wear': '',
    socks: '',
    'active-wear': '',
    trending: '',
    'not-sure': ''
  },
  theme: {
    primaryColor: '#2563eb',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  }
};

interface Blue84FormEditorProps {
  onFormUpdate?: (formData: any) => void;
  onClose?: () => void;
}

export const Blue84FormEditor = ({ onFormUpdate, onClose }: Blue84FormEditorProps) => {
  const { blue84FormData, handleBlue84FormUpdate } = useBlue84Form();
  const [editingStep, setEditingStep] = useState<FormStep | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'email'>('steps');
  const { toast } = useToast();

  // Initialize state from saved data
  const [steps, setSteps] = useState<FormStep[]>(blue84FormData.steps || initialSteps);
  const [formTitle, setFormTitle] = useState(blue84FormData.title || 'Blue84 Order Form');
  const [emailSettings, setEmailSettings] = useState(blue84FormData.email_settings || {
    enabled: false,
    emails: ['']
  });
  const [formFormat, setFormFormat] = useState<'multi-page' | 'vertical'>(blue84FormData.format || 'multi-page');
  const [formSettings, setFormSettings] = useState<FormSettings>({
    ...initialFormSettings,
    theme: {
      ...initialFormSettings.theme,
      ...blue84FormData.theme_settings,
      logo: blue84FormData.theme_settings?.logo
    }
  });

  // Sync with the hook when data changes
  useEffect(() => {
    if (blue84FormData) {
      setSteps(blue84FormData.steps || initialSteps);
      setFormTitle(blue84FormData.title || 'Blue84 Order Form');
      setEmailSettings(blue84FormData.email_settings || { enabled: false, emails: [''] });
      setFormFormat(blue84FormData.format || 'multi-page');
      setFormSettings({
        ...initialFormSettings,
        theme: {
          ...initialFormSettings.theme,
          ...blue84FormData.theme_settings,
          logo: blue84FormData.theme_settings?.logo
        }
      });
    }
  }, [blue84FormData]);

  const handleEditStep = (step: FormStep) => {
    setEditingStep(step);
  };

  const handleSaveStep = (updatedStepData: any) => {
    const newSteps = steps.map(step => 
      step.step === updatedStepData.step 
        ? { ...step, ...updatedStepData }
        : step
    );
    
    setSteps(newSteps);
    setEditingStep(null);
    
    // Immediately save to localStorage
    const updatedFormData = {
      title: formTitle,
      steps: newSteps,
      theme_settings: {
        ...formSettings.theme,
        logo: formSettings.theme.logo
      },
      email_settings: emailSettings,
      format: formFormat,
      updated_at: new Date().toISOString()
    };
    
    handleBlue84FormUpdate(updatedFormData);
    if (onFormUpdate) {
      onFormUpdate(updatedFormData);
    }
  };

  const handleImageUpload = (stepNumber: number, imageType: string, imageKey?: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          let newFormSettings = { ...formSettings };
          let newSteps = [...steps];
          
          if (imageType === 'brand-logo' && imageKey) {
            newFormSettings = {
              ...newFormSettings,
              brandLogos: {
                ...newFormSettings.brandLogos,
                [imageKey]: imageUrl
              }
            };
            setFormSettings(newFormSettings);
          } else if (imageType === 'product-image' && imageKey) {
            newFormSettings = {
              ...newFormSettings,
              productImages: {
                ...newFormSettings.productImages,
                [imageKey]: imageUrl
              }
            };
            setFormSettings(newFormSettings);
          } else if (imageType === 'card-image' && imageKey) {
            // Handle card image upload - format: fieldId-optionIndex
            const [fieldId, optionIndex] = imageKey.split('-');
            const optionIdx = parseInt(optionIndex);
            
            newSteps = steps.map(step => {
              if (step.step === stepNumber) {
                const updatedStep = {
                  ...step,
                  fields: step.fields.map(field => {
                    if (field.id === fieldId) {
                      const newOptions = [...(field.options || [])];
                      if (newOptions[optionIdx]) {
                        if (typeof newOptions[optionIdx] === 'string') {
                          // Convert string to object
                          const stringValue = newOptions[optionIdx] as string;
                          newOptions[optionIdx] = {
                            id: stringValue.toLowerCase().replace(/\s+/g, '-'),
                            name: stringValue,
                            description: '',
                            image: imageUrl
                          };
                        } else {
                          newOptions[optionIdx] = { ...newOptions[optionIdx], image: imageUrl };
                        }
                      }
                      return { ...field, options: newOptions };
                    }
                    return field;
                  })
                };
                
                // Update the editing step if it matches the current step
                if (editingStep && editingStep.step === stepNumber) {
                  setEditingStep(updatedStep);
                }
                
                return updatedStep;
              }
              return step;
            });
            
            setSteps(newSteps);
          }
          
          // Immediately save changes to localStorage
          const updatedFormData = {
            title: formTitle,
            steps: newSteps,
            theme_settings: {
              ...newFormSettings.theme,
              logo: newFormSettings.theme.logo
            },
            email_settings: emailSettings,
            format: formFormat,
            updated_at: new Date().toISOString()
          };
          
          handleBlue84FormUpdate(updatedFormData);
          if (onFormUpdate) {
            onFormUpdate(updatedFormData);
          }
          
          toast({
            title: 'Image Uploaded',
            description: 'Image has been uploaded successfully.',
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleEmailSettingsUpdate = (settings: { enabled?: boolean; emails?: string[] }) => {
    const newEmailSettings = {
      enabled: settings.enabled ?? emailSettings.enabled,
      emails: settings.emails ?? emailSettings.emails
    };
    
    setEmailSettings(newEmailSettings);
    
    // Immediately save to localStorage
    const updatedFormData = {
      title: formTitle,
      steps,
      theme_settings: {
        ...formSettings.theme,
        logo: formSettings.theme.logo
      },
      email_settings: newEmailSettings,
      format: formFormat,
      updated_at: new Date().toISOString()
    };
    
    handleBlue84FormUpdate(updatedFormData);
    if (onFormUpdate) {
      onFormUpdate(updatedFormData);
    }
  };

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const newFormSettings = {
            ...formSettings,
            theme: {
              ...formSettings.theme,
              logo: imageUrl
            }
          };
          
          setFormSettings(newFormSettings);
          
          // Immediately save to localStorage
          const updatedFormData = {
            title: formTitle,
            steps,
            theme_settings: {
              ...newFormSettings.theme,
              logo: imageUrl
            },
            email_settings: emailSettings,
            format: formFormat,
            updated_at: new Date().toISOString()
          };
          
          handleBlue84FormUpdate(updatedFormData);
          if (onFormUpdate) {
            onFormUpdate(updatedFormData);
          }
          
          toast({
            title: 'Logo Uploaded',
            description: 'Form logo has been updated successfully.',
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removeLogo = () => {
    const newFormSettings = {
      ...formSettings,
      theme: {
        ...formSettings.theme,
        logo: undefined
      }
    };
    
    setFormSettings(newFormSettings);
    
    // Immediately save to localStorage
    const updatedFormData = {
      title: formTitle,
      steps,
      theme_settings: {
        ...newFormSettings.theme,
        logo: undefined
      },
      email_settings: emailSettings,
      format: formFormat,
      updated_at: new Date().toISOString()
    };
    
    handleBlue84FormUpdate(updatedFormData);
    if (onFormUpdate) {
      onFormUpdate(updatedFormData);
    }
    
    toast({
      title: 'Logo Removed',
      description: 'Form logo has been removed.',
    });
  };

  const handleSaveForm = () => {
    const updatedFormData = {
      title: formTitle,
      steps,
      theme_settings: {
        ...formSettings.theme,
        logo: formSettings.theme.logo // Ensure logo is included
      },
      email_settings: emailSettings,
      format: formFormat,
      updated_at: new Date().toISOString()
    };
    
    // Call the update callback if provided
    handleBlue84FormUpdate(updatedFormData);
    if (onFormUpdate) {
      onFormUpdate(updatedFormData);
    }
    
    console.log('Saving form:', updatedFormData);
    toast({
      title: 'Form Saved',
      description: 'Your form configuration has been saved successfully.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onClose && (
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Blue84 Multi-Step Form Editor</h1>
                <p className="text-gray-600 mt-1">Configure your multi-step order form</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
              </Button>
              <Button
                onClick={handleSaveForm}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Form</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Configuration */}
          <div className="space-y-6">
            {/* Form Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Form Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="form-title">Form Title</Label>
                  <Input
                    id="form-title"
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      // Save title changes immediately
                      const updatedFormData = {
                        title: e.target.value,
                        steps,
                        theme_settings: {
                          ...formSettings.theme,
                          logo: formSettings.theme.logo
                        },
                        email_settings: emailSettings,
                        format: formFormat,
                        updated_at: new Date().toISOString()
                      };
                      handleBlue84FormUpdate(updatedFormData);
                      if (onFormUpdate) {
                        onFormUpdate(updatedFormData);
                      }
                    }}
                    placeholder="Enter form title"
                  />
                </div>
                
                <div>
                  <Label>Form Logo</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="h-16 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                      {formSettings?.theme?.logo ? (
                        <img 
                          src={formSettings.theme.logo} 
                          alt="Form Logo" 
                          className="h-14 w-30 object-contain" 
                        />
                      ) : (
                        <div className="text-gray-400 text-xs text-center">No logo</div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleLogoUpload()}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    {formSettings?.theme?.logo && (
                      <Button
                        onClick={() => removeLogo()}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Form Format</Label>
                  <div className="flex space-x-4 mt-2">
                    <Button
                      variant={formFormat === 'multi-page' ? 'default' : 'outline'}
                      onClick={() => {
                        setFormFormat('multi-page');
                        const updatedFormData = {
                          title: formTitle,
                          steps,
                          theme_settings: {
                            ...formSettings.theme,
                            logo: formSettings.theme.logo
                          },
                          email_settings: emailSettings,
                          format: 'multi-page',
                          updated_at: new Date().toISOString()
                        };
                        handleBlue84FormUpdate(updatedFormData);
                        if (onFormUpdate) {
                          onFormUpdate(updatedFormData);
                        }
                      }}
                      size="sm"
                    >
                      Multi-Page
                    </Button>
                    <Button
                      variant={formFormat === 'vertical' ? 'default' : 'outline'}
                      onClick={() => {
                        setFormFormat('vertical');
                        const updatedFormData = {
                          title: formTitle,
                          steps,
                          theme_settings: {
                            ...formSettings.theme,
                            logo: formSettings.theme.logo
                          },
                          email_settings: emailSettings,
                          format: 'vertical',
                          updated_at: new Date().toISOString()
                        };
                        handleBlue84FormUpdate(updatedFormData);
                        if (onFormUpdate) {
                          onFormUpdate(updatedFormData);
                        }
                      }}
                      size="sm"
                    >
                      Vertical
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formFormat === 'multi-page' 
                      ? 'Users navigate through steps one at a time' 
                      : 'All form fields are displayed in a single scrollable page'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Tabs */}
            <Card>
              <CardHeader>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('steps')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'steps'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Form Steps ({steps.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('email')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'email'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Email Settings
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTab === 'steps' && (
                  <>
                    {steps.map((step) => (
                      <div
                        key={step.step}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Step {step.step}
                              </Badge>
                              <h3 className="font-medium text-gray-900">{step.title}</h3>
                            </div>
                            {step.description && (
                              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">
                                {step.fields.length} fields
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleEditStep(step)}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span>Edit</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {activeTab === 'email' && (
                  <FormEmailSettings
                    emailSettings={emailSettings}
                    onUpdate={handleEmailSettingsUpdate}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Form Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[800px] overflow-y-auto">
                    <Blue84DynamicForm 
                      steps={steps} 
                      formSettings={formSettings}
                      emailSettings={emailSettings}
                      format={formFormat}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Step Editor Modal */}
      {editingStep && (
        <Blue84StepEditor
          open={!!editingStep}
          onOpenChange={(open) => !open && setEditingStep(null)}
          step={editingStep}
          onSave={handleSaveStep}
          onImageUpload={handleImageUpload}
          formSettings={formSettings}
        />
      )}
    </div>
  );
};
