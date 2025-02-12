import { LessonPlanSections } from '../../types.ts';

export interface LessonFieldChatBoxProps {
  onUpdateField: (fieldName: string | Array<[string, string]>, value?: string) => Promise<void>;
  currentValues: Record<string, string>;
  sections: LessonPlanSections;
  saveCurrentPlan: () => Promise<void>;
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
  className?: string;
}

export interface FieldUpdate {
  fieldToUpdate: string;
  userResponse: string;
  newValue: string;
}

export interface ChatResponse {
  response: string;
}

export type AIResponse = FieldUpdate | FieldUpdate[] | ChatResponse;

export const FIELD_LABELS: Record<string, string> = {
  // Basic info fields
  topic: 'נושא היחידה',
  duration: 'זמן כולל',
  gradeLevel: 'שכבת גיל',
  priorKnowledge: 'ידע קודם נדרש',
  position: 'מיקום בתוכן',
  contentGoals: 'מטרות ברמת התוכן',
  skillGoals: 'מטרות ברמת המיומנויות',
  
  // Lesson section fields
  'opening.0.content': 'פתיחה - תוכן/פעילות',
  'opening.0.spaceUsage': 'פתיחה - שימוש במרחב הפיזי',
  'opening.0.screen1Description': 'פתיחה - תיאור מסך 1',
  'opening.0.screen2Description': 'פתיחה - תיאור מסך 2',
  'opening.0.screen3Description': 'פתיחה - תיאור מסך 3',
  'main.0.content': 'גוף השיעור - תוכן/פעילות',
  'main.0.spaceUsage': 'גוף השיעור - שימוש במרחב הפיזי',
  'main.0.screen1Description': 'גוף השיעור - תיאור מסך 1',
  'main.0.screen2Description': 'גוף השיעור - תיאור מסך 2',
  'main.0.screen3Description': 'גוף השיעור - תיאור מסך 3',
  'summary.0.content': 'סיכום - תוכן/פעילות',
  'summary.0.spaceUsage': 'סיכום - שימוש במרחב הפיזי',
  'summary.0.screen1Description': 'סיכום - תיאור מסך 1',
  'summary.0.screen2Description': 'סיכום - תיאור מסך 2',
  'summary.0.screen3Description': 'סיכום - תיאור מסך 3'
};

export const QUICK_ACTIONS = [
  {text:'הצע שם חדש לנושא היחידה',maxWidth:'max-w-[86px]'},
  {text:'נסח מחדש מטרות ברמת התוכן',maxWidth:'max-w-[92px]'},
  {text:'שפר מטרות ברמת המיומנויות',maxWidth:'max-w-[90px]'},
  {text:'הצע רעיונות לפתיחת השיעור',maxWidth:'max-w-[86px]'},
  {text:'שפר פעילות בגוף השיעור',maxWidth:'max-w-[86px] mt-[5px]'},
  {text:'הצע זמן כולל',maxWidth:'min-w-[92px] mt-[5px] leading-7'},
  {text:'שפר ידע קודם נדרש',maxWidth:'max-w-[90px] mt-[5px]'},
  {text:'הצע שכבת גיל',maxWidth:'min-w-[86px] mt-[5px] leading-7'},
];

export const SPACE_USAGE_MAP = {
  'מליאה': 'whole',
  'עבודה בקבוצות': 'groups',
  'עבודה אישית': 'individual',
  'משולב': 'mixed'
} as const;

export const SCREEN_TYPE_MAP = {
  'סרטון': 'video',
  'תמונה': 'image',
  'פדלט': 'padlet',
  'אתר': 'website',
  'ג\'ניאלי': 'genially',
  'מצגת': 'presentation'
} as const;
