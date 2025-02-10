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
  'חינוך חברתי'
] as const;

export type LessonCategory = typeof LESSON_CATEGORIES[number];

export type LessonSection = {
  id: string;
  content: string;
  spaceUsage?: string;
  screen1?: string;
  screen2?: string;
  screen3?: string;
  screen1Description?: string;
  screen2Description?: string;
  screen3Description?: string;
};

export type LessonPlanSections = {
  opening: LessonSection[];
  main: LessonSection[];
  summary: LessonSection[];
};

export type LessonBasicInfo = {
  title: string;
  duration: string;
  gradeLevel: string;
  priorKnowledge: string;
  contentGoals: string;
  skillGoals: string;
};

export type LessonPlan = {
  id: string;
  userId: string;
  topic: string;
  duration: string;
  gradeLevel: string;
  priorKnowledge: string;
  position: string;
  contentGoals: string;
  skillGoals: string;
  sections: LessonPlanSections;
  status: 'draft' | 'published';
  description: string;
  basicInfo: LessonBasicInfo;
  category: LessonCategory;
  created_at: string;
  updated_at: string;
};
