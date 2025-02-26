import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog.tsx';
import { LessonFieldChatBox } from '../../lesson-planner/components/LessonFieldChatBox.tsx';
import type { LessonPlanSections } from '../../lesson-planner/types.ts';
import { ValidFieldNames } from './Layout.tsx';
import { Card, CardContent } from '../../../components/ui/card.tsx';

interface RightSidebarProps {
  saveInProgress: boolean;
  lastSaved: Date | null;
  lessonTitle?: string;
  totalSteps: number;
  onUpdateField: (fieldName: ValidFieldNames | Array<[string, string]>, value?: string) => Promise<void>;
  currentValues: Record<string, string>;
  saveCurrentPlan: () => Promise<void>;
  sections: LessonPlanSections;
  everSaved: boolean;
  createAndAddSection: (
    phase: keyof LessonPlanSections,
    content: string,
    spaceUsage?: string,
    screen1?: string,
    screen2?: string,
    screen3?: string,
    screen1Description?: string,
    screen2Description?: string,
    screen3Description?: string
  ) => Promise<void>;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  sections,  
  onUpdateField,
  currentValues,
  saveCurrentPlan,
  createAndAddSection,
  totalSteps,
  lessonTitle
}) => {
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = React.useState(false);

  const handleExitConfirm = async (withSave: boolean) => {
    if (withSave) {
      await saveCurrentPlan();
    }
    navigate('/');
  };

  return (
    <aside className="w-[30rem] border-l border-slate-200 shrink-0">
      <div className="w-[30rem] p-6 space-y-6">
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent className="max-w-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>עזיבת עריכת השיעור</AlertDialogTitle>
              <AlertDialogDescription>
                כיצד ברצונך לצאת מעריכת השיעור?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-6 py-4"></div>
            <AlertDialogFooter className="flex flex-row-reverse justify-start gap-2">
              <AlertDialogAction 
                className="bg-[#f06094] text-white hover:bg-[#f06094]/90"
                onClick={() => handleExitConfirm(true)}
              >
                שמור וצא
              </AlertDialogAction>
              <AlertDialogAction 
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => handleExitConfirm(false)}
              >
                צא ללא שמירה
              </AlertDialogAction>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Card className=''>
          <CardContent className="p-4 space-y-2 bg-[#fff4fc]">
            <div className="text-lg font-semibold text-[--theme-title-color]">סטטוס שיעור</div>
            <div className="text-sm text-slate-600">
              כותרת: &nbsp;
              {lessonTitle || "ללא כותרת"}
            </div>
            <div className="text-sm text-slate-600">
              פעילויות: &nbsp;
              {totalSteps} שלבים
            </div>
          </CardContent>
        </Card>
        <LessonFieldChatBox
          onUpdateField={onUpdateField}
          currentValues={currentValues}
          saveCurrentPlan={saveCurrentPlan}
          sections={sections}
          createAndAddSection={createAndAddSection}
        />
      </div>
    </aside>
  );
};

export { RightSidebar };
