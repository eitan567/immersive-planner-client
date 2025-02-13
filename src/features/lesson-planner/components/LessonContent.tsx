import React, { useState, useEffect } from 'react';
import { BasicInfoForm } from './BasicInfoForm.tsx';
import { LessonBuilder } from './LessonBuilder.tsx';
import LessonPlanPreview from './LessonPlanPreview.tsx';
import { cn } from "../../../lib/utils.ts"
import type { LessonPlan, LessonSection } from '../types.ts';

interface LessonContentProps {
  className?: string;
  currentStep: number;
  lessonPlan: LessonPlan;
  saveInProgress: boolean;
  lastSaved: Date | null;
  handleBasicInfoChange: (field: keyof LessonPlan, value: string) => void;
  addSection: (phase: 'opening' | 'main' | 'summary') => void;
  handleSectionUpdate: (
    phase: 'opening' | 'main' | 'summary',
    index: number,
    updates: Partial<LessonSection>
  ) => void;
  removeSection: (phase: 'opening' | 'main' | 'summary', index: number) => void;
  setCurrentStep: (updater: (prev: number) => number) => void;
  handleExport: () => void;
  generateLessonPlanText: () => string;
  saveCurrentPlan: () => Promise<void>;
}

export const LessonContent = React.memo(({
  className,
  currentStep,
  lessonPlan,
  saveInProgress,
  handleBasicInfoChange,
  addSection,
  handleSectionUpdate,
  removeSection,
  setCurrentStep,
  generateLessonPlanText,
  saveCurrentPlan
}: LessonContentProps) => {
  const validateRef = React.useRef<(() => boolean) | undefined>();
  
  // Expose validateRef to parent
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__lessonValidateRef = validateRef;
    }
  }, []);

  const handleNext = async () => {
    console.log('handleNext called');
    if (validateRef.current?.()) {
      console.log('Validation passed');
      await saveCurrentPlan();
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = async () => {
    console.log('handlePrevious called');
    if (currentStep === 1) {
      if (!validateRef.current?.()) {
        console.log('Validation failed on step 1; preventing navigation');
        return;
      }
    }
    await saveCurrentPlan();
    setCurrentStep(prev => prev - 1);
  };

  const [editedContent, setEditedContent] = useState<string>('');

  useEffect(() => {
    setEditedContent(generateLessonPlanText());
  }, [generateLessonPlanText]);

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
  };

  const handleExportWrapper = () => {
    const blob = new Blob([editedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lesson-plan.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className={cn("relative min-h-[calc(100vh-170px)] ", className)}>      
      <div className="space-y-4">
        {currentStep === 1 && (
          <>
            <BasicInfoForm
              lessonPlan={lessonPlan}
              handleBasicInfoChange={handleBasicInfoChange}
              validateRef={validateRef}
            />
            <LessonBuilder
              sections={lessonPlan.sections}
              onAddSection={addSection}
              onUpdateSection={handleSectionUpdate}
              onRemoveSection={removeSection}
            />
          </>
        )}
        
        {currentStep === 2 && (
          <LessonPlanPreview 
            content={editedContent} 
            onContentChange={handleContentChange}
          />
        )}
      </div>
    </div>
  );
});
