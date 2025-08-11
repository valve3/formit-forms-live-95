
import React from 'react';
import { Shield } from 'lucide-react';

interface SecurityVerificationProps {
  captchaVerified: boolean;
  captchaToken: string | null;
  onCaptchaTokenChange: (token: string | null) => void;
  onVerifyCaptcha: () => void;
}

const SecurityVerification: React.FC<SecurityVerificationProps> = ({
  captchaVerified,
  captchaToken,
  onCaptchaTokenChange,
  onVerifyCaptcha
}) => {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="h-5 w-5 text-blue-600" />
        <span className="themed-form-label">Security Verification Required</span>
      </div>
      
      {!captchaVerified ? (
        <div className="space-y-4">
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">Complete security verification to submit</p>
            <div className="flex items-center justify-center space-x-2">
              <input
                type="checkbox"
                id="captcha-check"
                onChange={(e) => onCaptchaTokenChange(e.target.checked ? crypto.randomUUID() : null)}
                className="rounded"
              />
              <label htmlFor="captcha-check" className="text-sm">I am not a robot</label>
            </div>
          </div>
          {captchaToken && (
            <button
              type="button"
              onClick={onVerifyCaptcha}
              className="themed-form-button"
            >
              Verify Security Check
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-700 font-medium">✓ Security verification completed</p>
        </div>
      )}
    </div>
  );
};

export default SecurityVerification;
