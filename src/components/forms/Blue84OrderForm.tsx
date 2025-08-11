import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export const Blue84OrderForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    hasLogo: false,
    logoType: '',
    productTypes: [],
    quantity: '',
    budgetRange: '',
    needsCustomArtwork: false,
    artworkDescription: ''
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { toast } = useToast();

  const productOptions = [
    { id: 'hat', label: 'Hat', icon: '🧢' },
    { id: 'casual-wear', label: 'Casual Wear', icon: '👕' },
    { id: 'socks', label: 'Socks', icon: '🧦' },
    { id: 'active-wear', label: 'Active Wear', icon: '🏃' },
    { id: 'trending', label: 'Trending', icon: '📈' },
    { id: 'not-sure', label: 'Not Sure', icon: '🤔' }
  ];

  const quantityOptions = [
    '48-100',
    '101-200',
    '200+'
  ];

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if current step can show submit/next button
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.firstName.trim() !== '' && 
               formData.lastName.trim() !== '' && 
               isValidEmail(formData.email);
      case 2:
      case 3:
        return true;
      case 4:
        return captchaVerified;
      default:
        return false;
    }
  };

  const handleProductTypeChange = (productId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      productTypes: checked 
        ? [...prev.productTypes, productId]
        : prev.productTypes.filter(id => id !== productId)
    }));
  };

  const verifyCaptcha = async () => {
    try {
      // Simulate CAPTCHA verification - replace with actual API call
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

  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!canProceed()) {
      toast({
        title: 'Form Incomplete',
        description: 'Please complete all required fields and verify CAPTCHA.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Form submitted:', formData);
    toast({
      title: 'Form Submitted',
      description: 'Your form has been submitted successfully!',
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 text-center">
        <div className="mb-4">
          <div className="text-lg font-bold">Blue</div>
        </div>
        <h1 className="text-2xl font-bold mb-2">
          Save Time By Getting Us The Info To Help Get You The Info You Need
        </h1>
        
        {/* Progress Steps */}
        <div className="flex justify-center items-center space-x-4 mt-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
              }`}>
                {step}
              </div>
              {step < 4 && <div className="w-8 h-px bg-blue-400 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: Contact Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`${
                    formData.email && !isValidEmail(formData.email) 
                      ? 'border-red-500 focus:border-red-500' 
                      : formData.email && isValidEmail(formData.email)
                      ? 'border-green-500 focus:border-green-500'
                      : ''
                  }`}
                  required
                />
                {formData.email && !isValidEmail(formData.email) && (
                  <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                )}
                {formData.email && isValidEmail(formData.email) && (
                  <p className="text-green-500 text-sm mt-1">Valid email address ✓</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Logo Requirements */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Looking for Better Logo Wear?</CardTitle>
              <p className="text-sm text-gray-600">What brands do you have interest in?</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {['Nike', 'Adidas', 'Callaway'].map((brand) => (
                  <div key={brand} className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium">{brand}</div>
                    <div className="text-sm text-gray-500">
                      {brand === 'Nike' && 'Apparel, Footwear, Accessories'}
                      {brand === 'Adidas' && 'BAGS'}
                      {brand === 'Callaway' && 'Headwear, Polos, Accessories'}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">What type of Company are you looking for?</Label>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        🏢
                      </div>
                      <div>
                        <div className="font-medium">Apparel Decorator</div>
                        <div className="text-sm text-gray-500">Screen Printing, Embroidery</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        👕
                      </div>
                      <div>
                        <div className="font-medium">Custom Stickers</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        🎨
                      </div>
                      <div>
                        <div className="font-medium">Promotional Products</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Product Selection and Quantities */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Product Selection</CardTitle>
              <p className="text-sm text-gray-600">What type of apparel are you looking for?</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {productOptions.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={product.id}
                      checked={formData.productTypes.includes(product.id)}
                      onCheckedChange={(checked) => handleProductTypeChange(product.id, checked as boolean)}
                    />
                    <label
                      htmlFor={product.id}
                      className="flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1"
                    >
                      <div className="text-2xl mb-2">{product.icon}</div>
                      <div className="text-sm font-medium">{product.label}</div>
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">Quantity Range</Label>
                <div className="grid grid-cols-3 gap-4">
                  {quantityOptions.map((qty) => (
                    <div key={qty} className="text-center">
                      <RadioGroup
                        value={formData.quantity}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, quantity: value }))}
                      >
                        <div className="flex items-center justify-center">
                          <RadioGroupItem value={qty} id={qty} />
                          <Label htmlFor={qty} className="ml-2 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 flex-1 text-center">
                            {qty}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="customField">What is The Custom field for?</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Corporate Event</SelectItem>
                    <SelectItem value="team">Team Uniforms</SelectItem>
                    <SelectItem value="promotional">Promotional Items</SelectItem>
                    <SelectItem value="retail">Retail Merchandise</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Budget and Custom Artwork with CAPTCHA */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Budget Range</CardTitle>
              <p className="text-sm text-gray-600">
                48 unit minimum, ranging $7 per garment / 
                order as little as 48. average size 2 shirt most days
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="budget">Budget: $2500</Label>
                <div className="mt-2 p-4 bg-gray-100 rounded-lg text-center">
                  <div className="text-sm">Save</div>
                  <div className="text-2xl font-bold text-green-600">$25000</div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">Do You Need Custom Artwork?</Label>
                <p className="text-sm text-gray-600 mb-4">
                  If you need help with your design we can make changes as we need to.
                  Complete marketing help or change for provided art
                </p>
                <RadioGroup
                  value={formData.needsCustomArtwork.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, needsCustomArtwork: value === 'true' }))}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="true" id="yes-artwork" />
                      <Label htmlFor="yes-artwork" className="cursor-pointer flex-1 text-center">
                        <div className="text-2xl mb-2">✓</div>
                        <div>Yes</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="false" id="no-artwork" />
                      <Label htmlFor="no-artwork" className="cursor-pointer flex-1 text-center">
                        <div className="text-2xl mb-2">✗</div>
                        <div>No</div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* CAPTCHA Section */}
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

          {currentStep < 4 ? (
            <Button 
              onClick={nextStep} 
              disabled={!canProceed()}
              className={`${
                canProceed() 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-300 cursor-not-allowed'
              } flex items-center space-x-2`}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!canProceed()}
              className={`${
                canProceed() 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Just Book A Meeting
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Step {currentStep} of 4
          {currentStep === 1 && !canProceed() && (
            <div className="mt-2 text-orange-600">
              Please fill in all required fields with valid information
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
