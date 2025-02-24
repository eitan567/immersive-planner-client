import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from './components/ui/card.tsx';
import './index.css';

import { AuthProvider } from './features/auth/AuthContext.tsx';
import { useAuth } from './features/auth/AuthContext.tsx';
import useLessonPlanState from './features/lesson-planner/hooks/useLessonPlanState.ts';
import LoginForm from './features/auth/LoginForm.tsx';
import { LoadingSpinner } from './components/ui/loading-spinner.tsx';
import { ErrorAlert } from './features/common/components/ErrorAlert.tsx';
import { LessonContent } from './features/lesson-planner/components/LessonContent.tsx';
import type { LessonPlan, LessonSection, LessonPlanSections } from './features/lesson-planner/types.ts';
import { Layout } from './features/common/components/Layout.tsx';
import { usePreventPageReset } from './hooks/usePreventPageReset.ts';
import { LessonDashboard } from './features/lesson-planner/components/LessonDashboard.tsx';

const LessonEditor = React.memo(() => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  // Don't pass id to useLessonPlanState if it's "new"
  const lessonId = id === 'new' ? undefined : id;
  
  const {
    currentStep,
    lessonPlan,
    loading,
    error,
    saveInProgress,
    lastSaved,
    handleBasicInfoChange,
    addSection,
    setCurrentStep,
    handleExport,
    generateLessonPlanText,
    updateSections,
    saveCurrentPlan,
    removeSection,
    createAndAddSection
  } = useLessonPlanState(lessonId);

  const handleSectionUpdate = React.useCallback((
    phase: 'opening' | 'main' | 'summary',
    index: number,
    updates: Partial<LessonSection>
  ) => {
    if (!lessonPlan) return;

    const updatedSections = {
      ...lessonPlan.sections,
      [phase]: lessonPlan.sections[phase].map((section: any, i: number) =>
        i === index ? { ...section, ...updates } : section
      )
    };

    updateSections(updatedSections);
  }, [lessonPlan, updateSections]);

  const handleFieldUpdate = React.useCallback(
  async (
    fieldName: 'category' | 'topic' | 'duration' | 'gradeLevel' | 'priorKnowledge' | 'position' | 'contentGoals' | 'skillGoals' | 'description' | Array<[string, string]>,
    value?: string
  ): Promise<void> => {
    if (!lessonPlan) return;

    const validFields = [
      'topic',
      'duration',
      'gradeLevel',
      'priorKnowledge',
      'position',
      'contentGoals',
      'skillGoals',
      'category',
      'description'
    ] as const;

    if (Array.isArray(fieldName)) {
      // Handle batch updates
      for (const [field, val] of fieldName) {
        if (validFields.includes(field as typeof validFields[number])) {
          await handleBasicInfoChange(field as typeof validFields[number], val);
        }
      }
    } else if (value && validFields.includes(fieldName)) {
      // Handle single update
      await handleBasicInfoChange(fieldName as typeof validFields[number], value);
    }
  },
  [handleBasicInfoChange, saveCurrentPlan, lessonPlan]
);

  const rightSidebarProps = React.useMemo(() => ({
    saveInProgress,
    lastSaved,
    everSaved: !!lessonPlan?.id,
    lessonTitle: lessonPlan?.topic || '',
    totalSteps: (lessonPlan?.sections?.opening?.length || 0) +
                (lessonPlan?.sections?.main?.length || 0) +
                (lessonPlan?.sections?.summary?.length || 0),
    onUpdateField: handleFieldUpdate,
    currentValues: {
      topic: lessonPlan?.topic || '',
      duration: String(lessonPlan?.duration || ''),
      gradeLevel: lessonPlan?.gradeLevel || '',
      priorKnowledge: lessonPlan?.priorKnowledge || '',
      position: String(lessonPlan?.position || ''),
      contentGoals: lessonPlan?.contentGoals || '',
      skillGoals: lessonPlan?.skillGoals || '',
      category: lessonPlan?.category || '',
      description: lessonPlan?.description || ''
    },
    sections: lessonPlan?.sections || { opening: [], main: [], summary: [] },
    saveCurrentPlan,
    createAndAddSection
  }), [saveInProgress, lastSaved, lessonPlan, handleFieldUpdate, saveCurrentPlan, createAndAddSection]);

  const leftSidebarProps = React.useMemo(() => ({
    saveInProgress,
    lastSaved,
    lessonTitle: lessonPlan?.topic || '',
    totalSteps: (lessonPlan?.sections?.opening?.length || 0) +
                (lessonPlan?.sections?.main?.length || 0) +
                (lessonPlan?.sections?.summary?.length || 0),
    onUpdateField: handleFieldUpdate,
    saveCurrentPlan,
    currentValues: {
      topic: lessonPlan?.topic || '',
      duration: String(lessonPlan?.duration || ''),
      gradeLevel: lessonPlan?.gradeLevel || '',
      priorKnowledge: lessonPlan?.priorKnowledge || '',
      position: String(lessonPlan?.position || ''),
      contentGoals: lessonPlan?.contentGoals || '',
      skillGoals: lessonPlan?.skillGoals || '',
      category: lessonPlan?.category || '',
      description: lessonPlan?.description || ''
    },
    sections: lessonPlan?.sections || { opening: [], main: [], summary: [] },
    everSaved: !!lessonPlan?.id,
    createAndAddSection
  }), [saveInProgress, lastSaved, lessonPlan, handleFieldUpdate, saveCurrentPlan]);

  useEffect(() => {
    if (!loading && !lessonPlan && id && id !== 'new') {
      setShouldRedirect(true);
    }
  }, [loading, lessonPlan, id]);

  useEffect(() => {
    if (shouldRedirect) {
      navigate('/');
    }
  }, [shouldRedirect, navigate]);

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />;
  }

  // Show loading spinner while lesson plan data is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      mode="lesson"
      rightSidebarProps={rightSidebarProps} 
      leftSidebarProps={leftSidebarProps}
      saveCurrentPlan={saveCurrentPlan}
      saveInProgress={saveInProgress}
      lastSaved={lastSaved}
      navigationProps={{
        currentStep,
        onPrevious: async () => {
          if (currentStep === 1) {
            const validateRef = (window as any).__lessonValidateRef;
            if (!validateRef?.current?.()) {
              return;
            }
          }
          await saveCurrentPlan();
          setCurrentStep(prev => prev - 1);
        },
        onNext: async () => {
          const validateRef = (window as any).__lessonValidateRef;
          if (!validateRef?.current || validateRef.current()) {
            await saveCurrentPlan();
            setCurrentStep(prev => prev + 1);
          }
        },
        onExport: currentStep === 2 ? handleExport : undefined
      }}      
    >
      <div className="min-h-full">
        <div dir="rtl" className="mx-auto space-y-0">
          {error && <ErrorAlert message={error} />}
          <Card className='border-0 shadow-none'>
            <CardContent className='min-h-[calc(100vh-160px)] pt-0'>
              {lessonPlan && (
                <LessonContent
                  currentStep={currentStep}
                  lessonPlan={lessonPlan}
                  saveInProgress={saveInProgress}
                  lastSaved={lastSaved}
                  handleBasicInfoChange={handleBasicInfoChange}
                  addSection={addSection}
                  handleSectionUpdate={handleSectionUpdate}
                  setCurrentStep={setCurrentStep}
                  handleExport={handleExport}
                  generateLessonPlanText={generateLessonPlanText}
                  saveCurrentPlan={saveCurrentPlan}
                  removeSection={removeSection}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
});

const MainContent = () => {
  const { user, loading: authLoading } = useAuth();
  usePreventPageReset();

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />;
  }

  return (
    <Routes>
      <Route path="/" element={<LessonDashboard />} />
      <Route path="/lesson/new" element={<LessonEditor />} />
      <Route path="/lesson/:id" element={<LessonEditor />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <MainContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
