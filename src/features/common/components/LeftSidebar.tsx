import React, { useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card.tsx';
// import { SaveProgressAlert } from './SaveProgressAlert.tsx';
import { LessonFieldChatBox } from '../../lesson-planner/components/LessonFieldChatBox.tsx';
import type { LessonPlanSections } from '../../lesson-planner/types.ts';

interface LeftSidebarProps {
  saveInProgress: boolean;
  lastSaved: Date | null;
  lessonTitle?: string;
  totalSteps: number;
  onUpdateField: (fieldName: string | Array<[string, string]>, value?: string) => Promise<void>;
  currentValues: Record<string, string>;
  saveCurrentPlan: () => Promise<void>;
  sections: LessonPlanSections;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  // saveInProgress,
  // lastSaved,
  sections,
  lessonTitle,
  totalSteps,
  onUpdateField,
  currentValues,
  saveCurrentPlan
}) => {
  // הוסף לוג לבדיקת הערכים
  useEffect(() => {
    console.log('Sidebar currentValues:', currentValues);
  }, []);

  return (
    <aside className="w-[30rem] border-r border-slate-200 shrink-0">
      <div className="fixed w-[30rem] p-6 space-y-6">
        <Card className='mb-4'>
          <CardContent className="p-4 space-y-2 bg-[#fff4fc]">
            <h3 className="font-medium text-slate-800">סטטוס שיעור</h3>
            <div className="text-sm text-slate-600">
              {lessonTitle || "ללא כותרת"}
            </div>
            <div className="text-sm text-slate-600">
              {totalSteps} שלבים
            </div>
          </CardContent>
        </Card>
        
        <LessonFieldChatBox
          onUpdateField={onUpdateField}
          currentValues={currentValues}
          saveCurrentPlan={saveCurrentPlan}
          sections={sections}
          className="h-[calc(100vh-470px)]"
        />

      </div>
    </aside>
  );
};

export { LeftSidebar };
