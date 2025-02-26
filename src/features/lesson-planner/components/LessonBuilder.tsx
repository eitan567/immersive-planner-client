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
  materials?: { title: string; content: string } | string;
  onSave?: () => Promise<void>;
}

export const LessonBuilder = ({
  sections,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onSave,
  materials
}: LessonBuilderProps) => {
  React.useEffect(() => {
    console.log('[LessonBuilder] Received sections:', sections);
    console.log('[LessonBuilder] Opening sections:', sections.opening);
    console.log('[LessonBuilder] Main sections:', sections.main);
    console.log('[LessonBuilder] Summary sections:', sections.summary);
    console.log('[LessonBuilder] Materials:', materials);
  }, [sections, materials]);

  return (
    <div>
      <h1 className="text-[1.2rem] font-semibold text-[#fa4083] pb-[10px] pt-[23px]">בניית השיעור</h1>
      <div dir='rtl' /*className='max-h-[calc(100vh-310px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#f2d8ff] hover:scrollbar-thumb-[#f2d8ff] scrollbar-thumb-rounded-md'*/>
        <div className='space-y-4 p-0'>
          <h3 className="text-[1rem] font-normal my-2 text-[#fa4083]">פתיחה</h3>
          <LessonPhase
            phase="opening"
            title=""
            sections={sections.opening}
            key={`opening-${sections.opening.length}`}
            onAddSection={onAddSection}
            onUpdateSection={onUpdateSection}
            onRemoveSection={onRemoveSection}
            materials={materials}
            onSave={onSave}
          />
          <h3 className="text-[1rem] font-normal my-2 text-[#fa4083]">גוף השיעור</h3>
          <LessonPhase
            phase="main"
            title=""
            sections={sections.main}
            key={`main-${sections.main.length}`}
            onAddSection={onAddSection}
            onUpdateSection={onUpdateSection}
            onRemoveSection={onRemoveSection}
            materials={materials}
            onSave={onSave}
          />
          <h3 className="text-[1rem] font-normal my-2 text-[#fa4083]">סיכום</h3>
          <LessonPhase
            phase="summary"
            title=""
            sections={sections.summary}
            key={`summary-${sections.summary.length}`}
            onAddSection={onAddSection}
            onUpdateSection={onUpdateSection}
            onRemoveSection={onRemoveSection}
            materials={materials}
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
};
