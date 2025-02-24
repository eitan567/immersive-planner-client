import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from './Navbar.tsx';
import { RightSidebar } from '../../lesson-planner/components/RightSidebar.tsx';
import { LeftSidebar } from './LeftSidebar.tsx';
import { DashboardRightSidebar } from './DashboardRightSidebar.tsx';
import type { LessonPlanSections } from '../../lesson-planner/types.ts';
import { FloatingSaveButton } from '../../lesson-planner/components/FloatingSaveButton.tsx';
import { NavigationControls } from '../../lesson-planner/components/NavigationControls.tsx';

export type ValidFieldNames = 'category' | 'topic' | 'duration' | 'gradeLevel' | 'priorKnowledge' | 'position' | 'contentGoals' | 'skillGoals' | 'description';

interface LessonRightSidebarProps {
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

interface DashboardRightSidebarProps {
  onCreateEmpty: () => void;
  onCreateAI: () => void;
}

interface NewRightSidebarProps {
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

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  mode: 'lesson' | 'dashboard' | 'new';
  saveCurrentPlan: () => Promise<void>;
  saveInProgress: boolean;
  lastSaved: Date | null;
  rightSidebarProps?: LessonRightSidebarProps | DashboardRightSidebarProps | NewRightSidebarProps;
  leftSidebarProps?: LessonRightSidebarProps;
  navigationProps?: {
    currentStep: number;
    onPrevious: () => Promise<void>;
    onNext: () => Promise<void>;
    onExport?: () => void;
  };
}

export const Layout = React.memo(({ saveCurrentPlan, saveInProgress, lastSaved, children, user, mode, rightSidebarProps, leftSidebarProps, navigationProps }: LayoutProps) => {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

  const toggleRightSidebar = () => setIsRightSidebarOpen(!isRightSidebarOpen);
  const toggleLeftSidebar = () => setIsLeftSidebarOpen(!isLeftSidebarOpen);

  const handleSave = async () => {
    const validateRef = (window as any).__lessonValidateRef;
    if (!validateRef?.current || validateRef.current()) {
      await saveCurrentPlan();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 flex flex-row-reverse mt-[72px] overflow-hidden">
        {mode === 'lesson' && leftSidebarProps && (
          <div className="relative flex">
            {/* LeftSidebar Container */}
            <div className={`bg-[#85003f05] border-r border-gray-300 transition-all duration-300 ease-in-out ${isLeftSidebarOpen ? 'w-[30rem]' : 'w-0'} overflow-hidden`}>
              <LeftSidebar {...leftSidebarProps} />
            </div>
            
            {/* Toggle Button */}
            <button
              onClick={toggleLeftSidebar}
              className="absolute -right-[0.20rem] top-0 -mr-4 z-10 flex items-center justify-center w-5 h-8 bg-[#fff4fc] rounded-l border border-slate-200 shadow-sm focus:outline-none"
              aria-label={isLeftSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isLeftSidebarOpen ? (
                <ChevronRight className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        )}

        <main className="flex-1 relative">
          <div className="absolute inset-0 bg-[#f9f9f9] z-0 mb-14 border-t border-b border-gray-300" >
          {mode === 'lesson' && (
            <div className="absolute -bottom-12 right-0 w-full px-3">
              {navigationProps?.currentStep === 1 && (<FloatingSaveButton
                onClick={handleSave}
                saving={saveInProgress}
                lastSaved={lastSaved}
                className="right-3 w-fit"
              />
              )}
              {navigationProps && (
                <NavigationControls
                  currentStep={navigationProps.currentStep}
                  onPrevious={navigationProps.onPrevious}
                  onNext={navigationProps.onNext}
                  onExport={navigationProps.onExport}
                  saving={saveInProgress}
                />
              )}
            </div>
          )}
          <div className="absolute inset-0 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#f2d8ff] hover:scrollbar-thumb-[#f2d8ff] scrollbar-thumb-rounded-md" dir="ltr">
            {children}
          </div>
          </div>
        </main>

        <div className="relative flex">
          {/* RightSidebar Container */}
          {mode === 'new' ? null : mode === 'lesson' && rightSidebarProps ? (
            <div className={`bg-[#85003f05] border-l border-gray-300 transition-all duration-300 ease-in-out ${isRightSidebarOpen ? 'w-[30rem]' : 'w-0'} overflow-hidden`}>
              <RightSidebar {...(rightSidebarProps as LessonRightSidebarProps)} />
            </div>
          ) : mode === 'dashboard' && rightSidebarProps ? (
            <div className={`bg-[#85003f05] border-l border-gray-300 transition-all duration-300 ease-in-out ${isRightSidebarOpen ? 'w-[12rem]' : 'w-0'} overflow-hidden`}>
              <DashboardRightSidebar {...(rightSidebarProps as DashboardRightSidebarProps)} />
            </div>
          ) : null}
          
          {/* Toggle Button */}
          <button
            onClick={toggleRightSidebar}
            className="absolute -left-[0.20rem] top-0 -ml-4 z-10 flex items-center justify-center w-5 h-8 bg-[#fff4fc] rounded-l border border-slate-200 shadow-sm focus:outline-none"
            aria-label={isRightSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isRightSidebarOpen ? (
              <ChevronRight className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
