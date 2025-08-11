
import React from 'react';

interface LoadingStateProps {
  type: 'loading' | 'not-found' | 'rate-limited' | 'success';
  title?: string;
  message?: string;
}

const LoadingStates: React.FC<LoadingStateProps> = ({ type, title, message }) => {
  const renderContent = () => {
    switch (type) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        );
      case 'success':
        return (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="themed-form-title">{title || 'Thank You!'}</h2>
            <p className="themed-form-description">{message || 'Your form has been submitted successfully.'}</p>
          </>
        );
      default:
        return (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">{message}</p>
          </div>
        );
    }
  };

  const containerClass = type === 'success' ? 'themed-form-card text-center py-12' : 'text-center';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className={containerClass}>
        {renderContent()}
      </div>
    </div>
  );
};

export default LoadingStates;
