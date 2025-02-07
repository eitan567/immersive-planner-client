import React from 'react';
import LessonPhase from './LessonPhase.tsx';
import type { LessonSection, LessonPlanSections } from '../types.ts';

interface LessonBuilderProps {
  sections: LessonPlanSections;
  onAddSection: (phase: 'opening' | 'main' | 'summary') => void;
  onUpdateSection: (
    phase: 'opening' | 'main' | 'summary',
    index: number,
    updates: Partial<LessonSection>
  ) => void;
  onRemoveSection: (phase: 'opening' | 'main' | 'summary', index: number) => void;
  onSave?: () => Promise<void>;
}

export const LessonBuilder = ({
  sections,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onSave
}: LessonBuilderProps) => {
  return (
    <div>
      <h1 className="text-[1.2rem] font-semibold text-[#540ba9] pb-[10px] pt-[23px]">בניית השיעור</h1>
      <div dir='rtl' /*className='max-h-[calc(100vh-310px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#f2d8ff] hover:scrollbar-thumb-[#f2d8ff] scrollbar-thumb-rounded-md'*/>
        <div className='space-y-4 p-0'>
          <h3 className="text-[1rem] font-normal my-2 text-[#540ba9]">פתיחה</h3>
          <LessonPhase
            phase="opening"
            title=""
            sections={sections.opening}
            onAddSection={onAddSection}
            onUpdateSection={onUpdateSection}
            onRemoveSection={onRemoveSection}
          />
          <h3 className="text-[1rem] font-normal my-2 text-[#540ba9]">גוף השיעור</h3>
          <LessonPhase
            phase="main"
            title=""
            sections={sections.main}
            onAddSection={onAddSection}
            onUpdateSection={onUpdateSection}
            onRemoveSection={onRemoveSection}
          />
          <h3 className="text-[1rem] font-normal my-2 text-[#540ba9]">סיכום</h3>
          <LessonPhase
            phase="summary"
            title=""
            sections={sections.summary}
            onAddSection={onAddSection}
            onUpdateSection={onUpdateSection}
            onRemoveSection={onRemoveSection}
          />
        </div>
      </div>
    </div>
  );
};