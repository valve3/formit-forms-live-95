
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Shield, Users, Shirt, Crown, User, Sun, TrendingUp, HelpCircle, Check, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
}

interface FormStep {
  step: number;
  title: string;
  description?: string;
  fields: FormField[];
  imageOptions?: any[];
}

interface Blue84DynamicFormProps {
  steps: FormStep[];
  formSettings: any;
  formId?: string;
  emailSettings?: any;
  format?: 'multi-page' | 'vertical';
}

export const Blue84DynamicForm = ({ steps, formSettings, formId = 'blue84-template', emailSettings, format = 'multi-page' }: Blue84DynamicFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(true); // Default to verified so CAPTCHA is not required
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentStepData = steps.find(step => step.step === currentStep);

  // Simple email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const verifyCaptcha = async () => {
    try {
      const response = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken })
      });
      
      if (response.ok) {
        setCaptchaVerified(true);
        toast({
          title: 'CAPTCHA Verified',
          description: 'You can now submit the form.',
        });
      } else {
        throw new Error('CAPTCHA verification failed');
      }
    } catch (error) {
      toast({
        title: 'CAPTCHA Error',
        description: 'Please try the CAPTCHA again.',
        variant: 'destructive',
      });
    }
  };

  // Check if current step has a valid email field
  const hasValidEmailInCurrentStep = () => {
    const emailField = currentStepData?.fields.find(field => field.type === 'email');
    if (!emailField) return false;
    const emailValue = formData[emailField.id];
    return emailValue && isValidEmail(emailValue);
  };

  const renderField = (field: FormField) => {
    const fieldValue = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'tel':
      case 'number':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              value={fieldValue}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );

      case 'email':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="email"
              value={fieldValue}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={`${
                fieldValue && !isValidEmail(fieldValue) 
                  ? 'border-red-500 focus:border-red-500' 
                  : fieldValue && isValidEmail(fieldValue)
                  ? 'border-green-500 focus:border-green-500'
                  : ''
              }`}
              required={field.required}
            />
            {fieldValue && !isValidEmail(fieldValue) && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
            )}
            {fieldValue && isValidEmail(fieldValue) && (
              <p className="text-green-500 text-sm mt-1">Valid email address ✓</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={fieldValue}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={fieldValue} onValueChange={(value) => updateFormData(field.id, value)}>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'radio':
        return (
          <div key={field.id}>
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={fieldValue}
              onValueChange={(value) => updateFormData(field.id, value)}
            >
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}_${index}`} />
                  <Label htmlFor={`${field.id}_${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id}>
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}_${index}`}
                    checked={(fieldValue || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = fieldValue || [];
                      if (checked) {
                        updateFormData(field.id, [...currentValues, option]);
                      } else {
                        updateFormData(field.id, currentValues.filter((v: string) => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}_${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'brand-cards':
        return (
          <div key={field.id}>
            <Label className="text-xl font-semibold mb-4 block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {field.options?.map((option: any, index: number) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all duration-200 ${
                    option.disabled 
                      ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                      : 'hover:shadow-md hover:border-blue-300'
                  } ${
                    (fieldValue || []).includes(option.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => {
                    if (option.disabled) return;
                    const currentValues = fieldValue || [];
                    if (currentValues.includes(option.id)) {
                      updateFormData(field.id, currentValues.filter((v: string) => v !== option.id));
                    } else {
                      updateFormData(field.id, [...currentValues, option.id]);
                    }
                  }}
                >
                  <CardContent className="p-0">
                    {option.image ? (
                      <div className="w-full h-24 overflow-hidden">
                        <img 
                          src={option.image} 
                          alt={option.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                    <div className="p-4 text-center">
                      <h3 className="font-medium text-lg">{option.name}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'garment-cards':
        const getGarmentIcon = (iconType: string) => {
          switch (iconType) {
            case 'hat':
              return <Crown className="h-8 w-8 text-blue-600" />;
            case 'shirt':
              return <Shirt className="h-8 w-8 text-blue-600" />;
            case 'socks':
              return <Users className="h-8 w-8 text-blue-600" />;
            case 'sun':
              return <Sun className="h-8 w-8 text-blue-600" />;
            case 'trending-up':
              return <TrendingUp className="h-8 w-8 text-blue-600" />;
            case 'help-circle':
              return <HelpCircle className="h-8 w-8 text-blue-600" />;
            default:
              return <User className="h-8 w-8 text-blue-600" />;
          }
        };

        return (
          <div key={field.id}>
            <Label className="text-xl font-semibold mb-4 block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {field.options?.map((option: any, index: number) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 ${
                    (fieldValue || []).includes(option.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => {
                    const currentValues = fieldValue || [];
                    if (currentValues.includes(option.id)) {
                      updateFormData(field.id, currentValues.filter((v: string) => v !== option.id));
                    } else {
                      updateFormData(field.id, [...currentValues, option.id]);
                    }
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                      {option.image ? (
                        <img 
                          src={option.image} 
                          alt={option.name} 
                          className="h-12 w-12 object-contain"
                        />
                      ) : (
                        getGarmentIcon(option.icon)
                      )}
                    </div>
                    <h3 className="font-medium text-lg">{option.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'quantity-buttons':
        return (
          <div key={field.id} className="space-y-4">
            <Label className="text-lg font-semibold">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex flex-wrap gap-3">
              {field.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={fieldValue === option ? "default" : "outline"}
                  onClick={() => updateFormData(field.id, option)}
                  className="px-6 py-3 text-base"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'budget-slider':
        const minValue = parseInt(field.options?.[0] || '500');
        const maxValue = parseInt(field.options?.[1] || '25000');
        const defaultValue = parseInt(field.options?.[2] || '2500');
        const currentValue = fieldValue || defaultValue;
        
        return (
          <div key={field.id} className="space-y-6">
            <div className="text-center">
              <Label className="text-lg font-semibold">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                ${currentValue?.toLocaleString() || defaultValue.toLocaleString()}
              </div>
            </div>
            
            <div className="px-4">
              <Slider
                value={[currentValue]}
                onValueChange={(value) => updateFormData(field.id, value[0])}
                max={maxValue}
                min={minValue}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>${minValue.toLocaleString()}</span>
                <span>${maxValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );

      case 'custom-artwork-cards':
        return (
          <div key={field.id} className="space-y-6">
            <div className="text-center">
              <Label className="text-2xl font-bold mb-4 block">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.description && (
                <p className="text-gray-600 text-base max-w-2xl mx-auto mb-6">
                  {field.description}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
              {field.options?.map((option: any, index: number) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    fieldValue === option.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => updateFormData(field.id, option.id)}
                >
                  <CardContent className="p-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                      {option.icon === 'check' ? (
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="h-8 w-8 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                          <X className="h-8 w-8 text-red-600" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold">{option.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber);
    }
  };

  const canProceed = () => {
    // Check if all required fields in current step are filled
    const requiredFields = currentStepData?.fields.filter(field => field.required) || [];
    return requiredFields.every(field => {
      const value = formData[field.id];
      if (field.type === 'email') {
        return value && isValidEmail(value);
      }
      return value !== undefined && value !== null && value !== '';
    });
  };

  const isLastStep = currentStep === steps.length;
  const showSubmitOnFirstStep = currentStep === 1 && hasValidEmailInCurrentStep();

  // Check if CAPTCHA is enabled in form settings
  const isCaptchaEnabled = formSettings?.theme?.captcha_enabled || false;

  const handleSubmit = async () => {
    if (isCaptchaEnabled && !captchaVerified) {
      toast({
        title: 'CAPTCHA Required',
        description: 'Please complete the CAPTCHA verification.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting form submission with data:', formData);
      
      // Submit to Supabase if this is a real form (not template)
      if (formId && formId !== 'blue84-template') {
        const { data, error } = await supabase
          .from('form_submissions')
          .insert({
            form_id: formId,
            submission_data: formData,
          });

        if (error) {
          console.error('Supabase submission error:', error);
          throw error;
        }

        console.log('Form submitted to database successfully:', data);

        // Send email notifications if enabled
        if (emailSettings?.enabled && emailSettings?.emails?.length > 0) {
          try {
            const { error: emailError } = await supabase.functions.invoke('send-form-email', {
              body: {
                formId,
                submissionData: formData,
                recipientEmails: emailSettings.emails,
                formTitle: 'Blue84 Order Form'
              }
            });

            if (emailError) {
              console.error('Email sending failed:', emailError);
              toast({
                title: 'Form Submitted',
                description: 'Your form was submitted but email notification failed to send.',
                variant: 'destructive',
              });
            } else {
              console.log('Email notifications sent successfully');
            }
          } catch (emailError) {
            console.error('Email sending error:', emailError);
          }
        }
      } else {
        console.log('Template mode - form data logged only:', formData);
      }

      toast({
        title: 'Form Submitted',
        description: 'Your form has been submitted successfully!',
      });

      // Reset form
      setFormData({});
      setCurrentStep(1);
      setCaptchaVerified(!isCaptchaEnabled); // Reset based on CAPTCHA setting
      setCaptchaToken(null);

    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Error',
        description: error.message || 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white text-blue-600 p-6 text-center border-b border-blue-200">
        <div className="mb-4">
          {formSettings?.theme?.logo ? (
            <img 
              src={formSettings.theme.logo} 
              alt="Blue84 Logo" 
              className="h-12 mx-auto object-contain"
            />
          ) : (
            <div className="text-lg font-bold">Blue84</div>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {currentStepData?.title || 'Multi-Step Form'}
        </h1>
        
        {/* Progress Steps */}
        {format === 'multi-page' && (
          <div className="flex justify-center items-center space-x-4 mt-6">
            {steps.map((step, index) => (
              <div key={step.step} className="flex items-center">
                <button
                  onClick={() => goToStep(step.step)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer hover:scale-105 ${
                    step.step <= currentStep ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {step.step}
                </button>
                {index < steps.length - 1 && <div className="w-8 h-px bg-blue-300 mx-2" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        {format === 'multi-page' ? (
          // Multi-page format - show current step only
          <>
            {currentStepData && (
              <Card>
                <CardHeader>
                  <CardTitle>{currentStepData.title}</CardTitle>
                  {currentStepData.description && (
                    <p className="text-sm text-gray-600">{currentStepData.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentStepData.fields.map(field => renderField(field))}

                  {/* CAPTCHA Section - only show if enabled */}
                  {isCaptchaEnabled && (showSubmitOnFirstStep || isLastStep) && (
                    <div className="border-t pt-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <Label className="text-base font-medium">Security Verification</Label>
                      </div>
                      
                      {!captchaVerified ? (
                        <div className="space-y-4">
                          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                            <p className="text-sm text-gray-600 mb-2">Please complete the security check</p>
                            <div className="flex items-center justify-center space-x-2">
                              <input
                                type="checkbox"
                                id="captcha-check"
                                onChange={(e) => setCaptchaToken(e.target.checked ? 'dummy-token' : null)}
                                className="rounded"
                              />
                              <label htmlFor="captcha-check" className="text-sm">I'm not a robot</label>
                            </div>
                          </div>
                          {captchaToken && (
                            <Button onClick={verifyCaptcha} variant="outline" className="w-full">
                              Verify Security Check
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                          <p className="text-green-700 font-medium">✓ Security verification completed</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex space-x-4">
                {/* Show submit button on first step when email is valid OR on last step */}
                {(showSubmitOnFirstStep || isLastStep) && (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={(isCaptchaEnabled && !captchaVerified) || isSubmitting}
                    className={`${
                      (!isCaptchaEnabled || captchaVerified) && !isSubmitting
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Form'}
                  </Button>
                )}

                {/* Show next button (except on last step) */}
                {!isLastStep && (
                  <Button 
                    onClick={nextStep} 
                    disabled={!canProceed()}
                    className={`${
                      canProceed() 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-300 cursor-not-allowed'
                    } flex items-center space-x-2`}
                  >
                    <span>{currentStep === 1 ? 'Tell us more' : 'Next'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Step {currentStep} of {steps.length}
              {!canProceed() && (
                <div className="mt-2 text-orange-600">
                  Please fill in all required fields with valid information
                </div>
              )}
              {isCaptchaEnabled && !captchaVerified && (showSubmitOnFirstStep || isLastStep) && (
                <div className="mt-2 text-orange-600">
                  Please complete the security verification to submit
                </div>
              )}
            </div>
          </>
        ) : (
          // Vertical format - show all steps
          <div className="space-y-8">
            {steps.map((step, index) => (
              <Card key={step.step}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                      {step.step}
                    </div>
                    <span>{step.title}</span>
                  </CardTitle>
                  {step.description && (
                    <p className="text-sm text-gray-600">{step.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {step.fields.map(field => renderField(field))}
                </CardContent>
              </Card>
            ))}

            {/* CAPTCHA Section for vertical format */}
            {isCaptchaEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span>Security Verification</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!captchaVerified ? (
                    <div className="space-y-4">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-2">Please complete the security check</p>
                        <div className="flex items-center justify-center space-x-2">
                          <input
                            type="checkbox"
                            id="captcha-check-vertical"
                            onChange={(e) => setCaptchaToken(e.target.checked ? 'dummy-token' : null)}
                            className="rounded"
                          />
                          <label htmlFor="captcha-check-vertical" className="text-sm">I'm not a robot</label>
                        </div>
                      </div>
                      {captchaToken && (
                        <Button onClick={verifyCaptcha} variant="outline" className="w-full">
                          Verify Security Check
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="text-green-700 font-medium">✓ Security verification completed</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submit Button for vertical format */}
            <div className="flex justify-center">
              <Button 
                onClick={handleSubmit} 
                disabled={(isCaptchaEnabled && !captchaVerified) || isSubmitting}
                className={`${
                  (!isCaptchaEnabled || captchaVerified) && !isSubmitting
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
