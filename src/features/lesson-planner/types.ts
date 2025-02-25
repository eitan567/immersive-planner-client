// מיפוי ערכים בעברית לאנגלית
export const POSITION_MAPPING = {
  'פתיחת נושא': 'opening',
  'הקנייה': 'teaching',
  'תרגול': 'practice',
  'סיכום נושא': 'summary'
} as const;

export const SPACE_USAGE_MAPPING = {
  'מליאה': 'whole',
  'עבודה בקבוצות': 'groups',
  'עבודה אישית': 'individual',
  'משולב': 'mixed'
} as const;

export const SCREEN_TYPE_MAPPING = {
  'סרטון': 'video',
  'תמונה': 'image',
  'פדלט': 'padlet',
  'אתר': 'website',
  'ג\'ניאלי': 'genially',
  'מצגת': 'presentation'
} as const;

export type PositionType = keyof typeof POSITION_MAPPING;
export type SpaceUsageType = keyof typeof SPACE_USAGE_MAPPING;
export type ScreenType = keyof typeof SCREEN_TYPE_MAPPING;

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
  description: string;
  sections: LessonPlanSections;
  materials?: { title: string; content: string } | string;
};

// DB Material type
export type Material = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
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
  material_id?: string;
};
