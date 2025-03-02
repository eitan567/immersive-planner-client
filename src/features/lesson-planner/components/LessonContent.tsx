import React, { useState, useEffect } from 'react';
import { BasicInfoForm } from './BasicInfoForm.tsx';
import { LessonBuilder } from './LessonBuilder.tsx';
import LessonPlanPreview from './LessonPlanPreview.tsx';
import { cn } from "../../../lib/utils.ts"
import type { LessonPlan, LessonSection } from '../types';

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

interface LessonContentProps {
  className?: string;
  currentStep: number;
  lessonPlan: LessonPlan;
  saveInProgress: boolean;
  lastSaved: Date | null;
  handleBasicInfoChange: (field: typeof validFields[number], value: string) => void;
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
  materials?: { title: string; content: string } | string;
}

export const LessonContent = React.memo(({
  className,
  currentStep,
  lessonPlan,  
  handleBasicInfoChange,
  addSection,
  handleSectionUpdate,
  removeSection,  
  generateLessonPlanText,
  materials
}: LessonContentProps) => {
  const validateRef = React.useRef<(() => boolean) | undefined>();
  
  // Expose validateRef to parent
  React.useEffect(() => {
    console.log("lessonPlan:", lessonPlan);
    if (typeof window !== 'undefined') {
      (window as any).__lessonValidateRef = validateRef;
    }
  }, []);

  const [editedContent, setEditedContent] = useState<string>('');

  useEffect(() => {
    setEditedContent(generateLessonPlanText());
  }, [generateLessonPlanText]);

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
  };

  return (
    <div className={cn("relative min-h-[calc(100vh-170px)] ", className)}>      
      <div className="space-y-4">
        {currentStep === 1 && (
          <>
            <BasicInfoForm
              lessonPlan={{
                ...lessonPlan,
                material_id: lessonPlan.material_id // העברת מזהה חומרי העזר
              }}
              handleBasicInfoChange={handleBasicInfoChange}
              validateRef={validateRef}
              materials={lessonPlan.materials}
            />
            <LessonBuilder
              sections={lessonPlan.sections}
              onAddSection={addSection}
              materials={lessonPlan.materials}
              onUpdateSection={handleSectionUpdate}
              onRemoveSection={removeSection}
            />
          </>
        )}
        
        {currentStep === 2 && (
          <LessonPlanPreview 
            content={editedContent} 
            onContentChange={handleContentChange}
            lesson={lessonPlan}
          />
        )}
      </div>
    </div>
  );
});
