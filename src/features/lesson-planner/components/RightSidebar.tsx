import React, { useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card.tsx';
import { Button } from '../../../components/ui/button.tsx';
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
import { LessonFieldChatBox } from './LessonFieldChatBox.tsx';
import type { LessonPlanSections } from '../types.ts';

interface RightSidebarProps {
  saveInProgress: boolean;
  lastSaved: Date | null;
  lessonTitle?: string;
  totalSteps: number;
  onUpdateField: (fieldName: string | Array<[string, string]>, value?: string) => Promise<void>;
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
  lessonTitle,
  totalSteps,
  onUpdateField,
  currentValues,
  saveCurrentPlan,
  createAndAddSection,
  everSaved
}) => {
  useEffect(() => {
    console.log('Sidebar currentValues:', currentValues);
  }, []);

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
        <Button 
          variant="secondary" 
          className="w-full flex items-center justify-center gap-2 mb-4" 
          onClick={() => setShowExitDialog(true)}
        >
          <span>חזרה לדשבורד</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Button>

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
                className="bg-[#681bc2] text-white hover:bg-[#681bc2]/90"
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
