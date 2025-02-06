import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from './Navbar.tsx';
import { RightSidebar } from './RightSidebar.tsx';
import { LeftSidebar } from './LeftSidebar.tsx';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  rightSidebarProps: {
    saveInProgress: boolean;
    lastSaved: Date | null;
    lessonTitle?: string;
    totalSteps: number;
    onUpdateField: (fieldName: string | Array<[string, string]>, value?: string) => Promise<void>;
    currentValues: Record<string, string>;
    saveCurrentPlan: () => Promise<void>;
    sections: {
      opening: any;
      main: any;
      summary: any;
    };
  };
  leftSidebarProps: {
    saveInProgress: boolean;
    lastSaved: Date | null;
    lessonTitle?: string;
    totalSteps: number;
    onUpdateField: (fieldName: string | Array<[string, string]>, value?: string) => Promise<void>;
    currentValues: Record<string, string>;
    saveCurrentPlan: () => Promise<void>;
    sections: {
      opening: any;
      main: any;
      summary: any;
    };
  };
}

export const Layout = React.memo(({ children, user, rightSidebarProps, leftSidebarProps }: LayoutProps) => {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

  const toggleRightSidebar = () => setIsRightSidebarOpen(!isRightSidebarOpen);
  const toggleLeftSidebar = () => setIsLeftSidebarOpen(!isLeftSidebarOpen);

  return (
    <div className="h-screen flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 flex flex-row-reverse mt-[72px] overflow-hidden">

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

        <main className="flex-1 relative">
          <div className="absolute inset-0 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#f2d8ff] hover:scrollbar-thumb-[#f2d8ff] scrollbar-thumb-rounded-md" dir="ltr">
            {children}
          </div>
        </main>

        <div className="relative flex">
          {/* RightSidebar Container */}
          <div className={`bg-[#85003f05] border-l border-gray-300 transition-all duration-300 ease-in-out ${isRightSidebarOpen ? 'w-[30rem]' : 'w-0'} overflow-hidden`}>
            <RightSidebar {...rightSidebarProps} />
          </div>
          
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