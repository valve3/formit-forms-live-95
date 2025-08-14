
import { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/auth/AuthPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FormsList } from "@/components/forms/FormsList";
import { FormBuilder } from "@/components/forms/FormBuilder";
import { UserManagement } from "@/components/admin/UserManagement";
import { SubmissionsList } from "@/components/submissions/SubmissionsList";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EmbedForm from "./pages/EmbedForm";
import Blue84Form from "./pages/Blue84Form";
import Blue84FormEditor from "./pages/Blue84FormEditor";
import { ThemesPage } from "@/components/themes/ThemesPage";

const queryClient = new QueryClient();

const DashboardContent = () => {
  const [currentView, setCurrentView] = useState('forms');
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [extractedThemes, setExtractedThemes] = useState<any[]>([]);
  const { profile } = useAuth();

  const handleThemeAdded = (theme: any) => {
    setExtractedThemes(prev => [...prev, theme]);
  };

  const handleRemoveExtractedTheme = (themeId: string) => {
    setExtractedThemes(prev => prev.filter(theme => theme.id !== themeId));
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'forms':
        return (
          <FormsList
            onCreateForm={() => {
              setCurrentFormId(null);
              setCurrentView('builder');
            }}
            onEditForm={(formId) => {
              setCurrentFormId(formId);
              setCurrentView('builder');
            }}
          />
        );
      case 'builder':
        return (
          <FormBuilder
            formId={currentFormId || undefined}
            onBack={() => setCurrentView('forms')}
          />
        );
      case 'themes':
        return (
          <ThemesPage
            extractedThemes={extractedThemes}
            onThemeAdded={handleThemeAdded}
            onRemoveExtractedTheme={handleRemoveExtractedTheme}
          />
        );
      case 'submissions':
        return <SubmissionsList />;
      case 'users':
        return profile?.role === 'admin' ? <UserManagement /> : <div>Access denied</div>;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <FormsList onCreateForm={() => setCurrentView('builder')} onEditForm={() => {}} />;
    }
  };

  return (
    <DashboardLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderCurrentView()}
    </DashboardLayout>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardContent />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/embed/:formId" element={<EmbedForm />} />
            <Route path="/blue84-form" element={<Blue84Form />} />
            <Route path="/blue84-form-editor" element={<Blue84FormEditor />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
