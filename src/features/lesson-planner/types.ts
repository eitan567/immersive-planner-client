export const LESSON_CATEGORIES = [
  'מתמטיקה',
  'אנגלית',
  'עברית',
  'תנ״ך',
  'היסטוריה',
  'אזרחות',
  'ספרות',
  'פיזיקה',
  'כימיה',
  'ביולוגיה',
  'מדעים',
  'גיאוגרפיה',
  'מחשבים',
  'אומנות',
  'מוזיקה',
  'חינוך גופני',
  'פילוסופיה',
  'פסיכולוגיה',
  'סוציולוגיה',
  'חינוך חברתי',
  'טכנולוגיה',
  'כלכלה',
  'סטטיסטיקה',
  'פיננסים',
  'מנהיגות',
  'תקשורת',
  'ארכיטקטורה',
  'עיצוב',  
  'פיתוח תוכנה',
  'בינה מלאכותית',
  'אבטחת מידע'
] as const;

export type LessonCategory = typeof LESSON_CATEGORIES[number];

export type LessonScreens = {
  screen1: string;
  screen2: string;
  screen3: string;
  screen1Description: string;
  screen2Description: string;
  screen3Description: string;
};

export type LessonSection = {
  id: string;
  content: string;
  spaceUsage: string;
  // For UI components
  screen1?: string;
  screen2?: string;
  screen3?: string;
  screen1Description?: string;
  screen2Description?: string;
  screen3Description?: string;
  // For server communication
  screens?: LessonScreens;
};

export type LessonPlanSections = {
  opening: LessonSection[];
  main: LessonSection[];
  summary: LessonSection[];
};

// Base lesson data used in forms and UI
export type LessonFormData = {
  category: LessonCategory | '';
  topic: string;
  duration: string;
  gradeLevel: string;
  priorKnowledge: string;
  position: string;
  contentGoals: string;
  skillGoals: string;
  sections: LessonPlanSections;
};

// Full lesson plan with DB fields
export type LessonPlan = {
  category: LessonCategory | '';
  topic: string;
  duration: string;
  gradeLevel: string;
  priorKnowledge: string;
  position: string;
  contentGoals: string;
  skillGoals: string;
  sections: LessonPlanSections;
  id: string;
  userId: string;
  status: 'draft' | 'published';
  description: string;
  created_at: string;
  updated_at: string;
};
