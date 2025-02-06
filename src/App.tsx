import React, { useEffect } from 'react';
import { Card, CardContent } from './components/ui/card.tsx';
import './index.css';

import { AuthProvider } from './features/auth/AuthContext.tsx';
import { useAuth } from './features/auth/AuthContext.tsx';
import useLessonPlanState from './features/lesson-planner/hooks/useLessonPlanState.ts';
import LoginForm from './features/auth/LoginForm.tsx';
import { LoadingSpinner } from './components/ui/loading-spinner.tsx';
import { ErrorAlert } from './features/common/components/ErrorAlert.tsx';
import { LessonContent } from './features/lesson-planner/components/LessonContent.tsx';
import type { LessonPlan, LessonSection } from './features/lesson-planner/types.ts';
import { Layout } from './features/common/components/Layout.tsx';
import { usePreventPageReset } from './hooks/usePreventPageReset.ts';

// בתוך הקומפוננטה
const MainContent = React.memo(() => {
  const { user, loading: authLoading } = useAuth();
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
    removeSection
  } = useLessonPlanState();

  useEffect(() => {
    console.log('MainContent lessonPlan:', lessonPlan);
  }, []);

  const handleSectionUpdate = React.useCallback((
    phase: 'opening' | 'main' | 'summary',
    index: number,
    updates: Partial<LessonSection>
  ) => {
    if (!lessonPlan) return;

    const updatedSections = {
      ...lessonPlan.sections,
      [phase]: lessonPlan.sections[phase].map((section, i) =>
        i === index ? { ...section, ...updates } : section
      )
    };

    updateSections(updatedSections);
  }, [lessonPlan, updateSections]);

  const handleFieldUpdate = React.useCallback(async (fieldName: string | Array<[string, string]>, value?: string) => {
    if (!lessonPlan) return;
    
    const validFields: (keyof LessonPlan)[] = [
      'topic', 'duration', 'gradeLevel', 'priorKnowledge',
      'position', 'contentGoals', 'skillGoals'
    ];

    if (Array.isArray(fieldName)) {
      // Handle batch updates
      for (const [field, val] of fieldName) {
        if (validFields.includes(field as keyof LessonPlan)) {
          handleBasicInfoChange(field as keyof LessonPlan, val);
        }
      }
      await saveCurrentPlan();
    } else if (value && validFields.includes(fieldName as keyof LessonPlan)) {
      // Handle single update
      handleBasicInfoChange(fieldName as keyof LessonPlan, value);
      await saveCurrentPlan();
    }
  }, [handleBasicInfoChange, saveCurrentPlan, lessonPlan]);

  const rightSidebarProps = React.useMemo(() => ({
    saveInProgress,
    lastSaved,
    lessonTitle: lessonPlan?.basicInfo?.title || '',
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
      skillGoals: lessonPlan?.skillGoals || ''
    },
    sections: lessonPlan?.sections || { opening: [], main: [], summary: [] },
    saveCurrentPlan
  }), [saveInProgress, lastSaved, lessonPlan, handleFieldUpdate, saveCurrentPlan]);

  const leftSidebarProps = React.useMemo(() => ({
    saveInProgress,
    lastSaved,
    lessonTitle: lessonPlan?.basicInfo?.title || '',
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
      skillGoals: lessonPlan?.skillGoals || ''
    },
    sections: lessonPlan?.sections || { opening: [], main: [], summary: [] }
  }), [saveInProgress, lastSaved, lessonPlan, handleFieldUpdate, saveCurrentPlan]);

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
    <Layout user={user} rightSidebarProps={rightSidebarProps} leftSidebarProps={leftSidebarProps}>
      <div className="p-6 min-h-full">
        <div dir="rtl" className="mx-auto space-y-6">
          {error && <ErrorAlert message={error} />}
          <Card>
            <CardContent className='min-h-[calc(100vh-130px)]'>
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
                  // className='min-h-[calc(100vh-130px)]'
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
});

const App = () => {
  usePreventPageReset();

  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;