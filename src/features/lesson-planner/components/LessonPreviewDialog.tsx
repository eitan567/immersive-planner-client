import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "../../../components/ui/dialog.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { Eye, X, Download } from 'lucide-react';
import LessonPlanPreview from './LessonPlanPreview.tsx';
import type { LessonPlan } from '../types.ts';
import { translateContent } from "../../../utils/translations.ts";

interface LessonPreviewDialogProps {
  lesson: LessonPlan;
}

export function LessonPreviewDialog({ lesson }: LessonPreviewDialogProps) {
  const getLessonContent = (lesson: LessonPlan) => {
    let content = '';

    // כותרת ומידע בסיסי
    content += `נושא היחידה: ${lesson.topic}\n`;
    content += `זמן כולל: ${lesson.duration}\n`;
    content += `שכבת גיל: ${lesson.gradeLevel}\n`;
    content += `ידע קודם נדרש: ${lesson.priorKnowledge}\n`;
    content += `מיקום בתוכן: ${lesson.position}\n\n`;

    // מטרות
    content += `מטרות ברמת התוכן:\n${lesson.contentGoals}\n\n`;
    content += `מטרות ברמת המיומנויות:\n${lesson.skillGoals}\n\n`;

    // פתיחה
    content += `== פתיחה ==\n\n`;
    lesson.sections.opening.forEach((section, index) => {
      content += `פעילות ${index + 1}:\n`;
      content += `תוכן/פעילות: ${section.content}\n`;
      if (section.screen1) {
        content += `מסך 1: ${section.screen1}\n`;
        content += `תיאור מסך 1: ${section.screen1Description}\n`;
      }
      if (section.screen2) {
        content += `מסך 2: ${section.screen2}\n`;
        content += `תיאור מסך 2: ${section.screen2Description}\n`;
      }
      if (section.screen3) {
        content += `מסך 3: ${section.screen3}\n`;
        content += `תיאור מסך 3: ${section.screen3Description}\n`;
      }
      content += `שימוש במרחב הפיזי: ${section.spaceUsage}\n\n`;
    });

    // גוף השיעור
    content += `== גוף השיעור ==\n\n`;
    lesson.sections.main.forEach((section, index) => {
      content += `פעילות ${index + 1}:\n`;
      content += `תוכן/פעילות: ${section.content}\n`;
      if (section.screen1) {
        content += `מסך 1: ${section.screen1}\n`;
        content += `תיאור מסך 1: ${section.screen1Description}\n`;
      }
      if (section.screen2) {
        content += `מסך 2: ${section.screen2}\n`;
        content += `תיאור מסך 2: ${section.screen2Description}\n`;
      }
      if (section.screen3) {
        content += `מסך 3: ${section.screen3}\n`;
        content += `תיאור מסך 3: ${section.screen3Description}\n`;
      }
      content += `שימוש במרחב הפיזי: ${section.spaceUsage}\n\n`;
    });

    // סיכום
    content += `== סיכום ==\n\n`;
    lesson.sections.summary.forEach((section, index) => {
      content += `פעילות ${index + 1}:\n`;
      content += `תוכן/פעילות: ${section.content}\n`;
      if (section.screen1) {
        content += `מסך 1: ${section.screen1}\n`;
        content += `תיאור מסך 1: ${section.screen1Description}\n`;
      }
      if (section.screen2) {
        content += `מסך 2: ${section.screen2}\n`;
        content += `תיאור מסך 2: ${section.screen2Description}\n`;
      }
      if (section.screen3) {
        content += `מסך 3: ${section.screen3}\n`;
        content += `תיאור מסך 3: ${section.screen3Description}\n`;
      }
      content += `שימוש במרחב הפיזי: ${section.spaceUsage}\n\n`;
    });

    return translateContent(content.trim());
  };

  const handleExport = () => {
    const content = getLessonContent(lesson);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lesson.basicInfo.title}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          onClick={(e) => e.stopPropagation()}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[75vh] bg-white" onClick={(e) => e.stopPropagation()}>
        {/* <DialogHeader>
          <DialogTitle>
            תצוגה מקדימה - {lesson.basicInfo.title}
          </DialogTitle>
        </DialogHeader> */}
        <div className="flex flex-col h-full overflow-hidden">
          <LessonPlanPreview lesson={lesson} content={getLessonContent(lesson)} 
            aiClassName='max-h-[calc(100vh-460px)]' 
            className="h-[calc(100vh-300px)] max-h-[calc(100vh-300px)] border-none shadow-none" 
            cardContentClassName="h-[calc(100vh-400px)]"/>
          <DialogFooter>
            <Button
              onClick={handleExport}
              variant="outline"
              className="text-gray-700 hover:text-gray-900"
            >
              <Download className="w-4 h-4 ml-2" />
              ייצא לקובץ טקסט
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
