import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card.tsx";
import { AITextarea } from "../../../components/ui/ai-textarea.tsx";
import { cn } from '../../../lib/utils.ts';
import { LessonPlan } from '../types.ts';
// import { translateContent } from "../../../utils/translations.ts";

interface LessonPlanPreviewProps {
  content: string;
  className?: string;
  aiClassName?: string;
  cardContentClassName?: string;
  lesson: LessonPlan;
  onContentChange?: (newContent: string) => void;
}

const LessonPlanPreview = ({ content: initialContent, onContentChange,aiClassName, className, cardContentClassName,lesson }: LessonPlanPreviewProps) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
  };

  return (
    <Card className={cn("border-gray-200", className)} onClick={(e) => e.stopPropagation()}>
      <CardHeader className='py-0'>
        <CardTitle className='text-2xl font-semibold text-[#540ba9]'>תצוגה מקדימה - {lesson.basicInfo.title}</CardTitle>
      </CardHeader>
      <CardContent className={cn("bg-white", cardContentClassName)}>
        <AITextarea
          onClick={(e) => e.stopPropagation()}
          aiOn={false}
          value={content}
          onChange={handleContentChange}
          dir="rtl"
          className={cn("w-full h-[calc(100vh-300px)] text-right font-['Varela_Round'] text-[1.05rem] leading-7 bg-gray-50 p-6 rounded-lg border border-gray-100 text-gray-700 resize-y focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 transition-all duration-200",aiClassName)}
          style={{ 
            fontFamily: "'Varela Round', 'Assistant', sans-serif",
            fontFeatureSettings: '"kern"',
            WebkitFontSmoothing: 'antialiased'
          }}
          context={content}          
        />
      </CardContent>
    </Card>
  );
};

export default LessonPlanPreview;
