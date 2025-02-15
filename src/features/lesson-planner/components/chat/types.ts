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
  field: string;
  value: string;
  chat?: string;
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
  category: 'קטגוריה',
  
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

export interface QuickAction {
  text: string;
  maxWidth?: string;
  bgColor?: string;
}

// Original quick actions that appear below the chat
export const QUICK_ACTIONS: QuickAction[] = [
  {text:'הצע שם לנושא היחידה',maxWidth:'max-w-[86px]'},
  {text:'הצע מטרות ברמת התוכן',maxWidth:'max-w-[92px]'},
  {text:'הצע מטרות ברמת המיומנויות',maxWidth:'max-w-[90px]'},
  {text:'הצע זמן כולל',maxWidth:'min-w-[92px] mt-[5px] leading-7'},
  {text:'הצע ידע קודם נדרש',maxWidth:'max-w-[90px] mt-[5px]'},
  {text:'הצע שכבת גיל',maxWidth:'min-w-[86px] mt-[5px] leading-7'},
  {text:'הצע מיקום בתוכן',maxWidth:'min-w-[86px] mt-[5px] leading-7'},
  {text:'הצע פעילות סיכום',maxWidth:'min-w-[92px] mt-[5px] leading-7',bgColor:'bg-[#ffb8f2]'},
  {text:'הצע פעילות פתיחה',maxWidth:'max-w-[86px]',bgColor:'bg-[#ffb8f2]'},
  {text:'הצע פעילות גוף השיעור',maxWidth:'max-w-[86px] mt-[5px]',bgColor:'bg-[#ffb8f2]'},
  {text:'הצע ערכים בכל השדות הריקים',maxWidth:'max-w-[86px] mt-[5px]',bgColor:'bg-[#ff8eea]'},
  {text:'הצע ערכים בכל השדות',maxWidth:'max-w-[86px] mt-[5px]',bgColor:'bg-[#ff8eea]'},
];

// Additional quick actions for the dropdown menu
export const DROPDOWN_QUICK_ACTIONS: QuickAction[] = [
  {text: 'הצע רעיון לכול שאר השדות בהתאם לנושא היחידה הקיים'},
  {text: 'התאם את הקטגוריה לנושא היחידה'},
  {text: 'הצע נושא יחידה בהתאם לקטגוריה'},
  {text: 'הצע רעיונות גיוון לפעילות הקיימת בגוף השיעור'},
  {text: 'בדוק את רמת הקושי של החידות בפתיחה והצע התאמות לשכבת הגיל'},
  {text: 'הצע דרכים לשילוב משחקיות בגוף השיעור'},
  {text: 'הצע רעיונות לחיזוק שיתוף הפעולה בין התלמידים'},
  {text: 'נסח מחדש את מטרות המיומנויות בצורה ברורה יותר'},
  {text: 'הצע פעילות פתיחה אינטראקטיבית יותר'},
  {text: 'הצע רעיונות ליצירת תמונות דינמיות או אנימציות'},
  {text: 'נסח מחדש את החידות כך שיהיו קשורות יותר למרחב הפיזי של החדר'},
  {text: 'הצע דרכים לשילוב אלמנטים של תנועה ומשחק בפתיחה'},
  {text: 'הצע פעילות נוספת בגוף השיעור שתאפשר לתלמידים לחקור את הנושא בצורה מעמיקה יותר'},
  {text: 'נסח מחדש את ההוראות ליצירת המצגות כך שיהיו ברורות וממוקדות'},
  {text: 'הצע דרכים לשילוב אלמנטים אינטראקטיביים במצגות של התלמידים'},
  {text: 'הצע דרכים להציג את המצגות על המסך האימרסיבי בצורה שתמשוך את תשומת לב התלמידים'},
  {text: 'הצע דרכים לשילוב משוב מיידי לתלמידים על המצגות שלהם'},
  {text: 'הצע פעילות סיכום אינטראקטיבית שתסכם את הנושא בצורה מהנה'},
  {text: 'הצע רעיונות ליצירת סרטון סיכום קצר של השיעור'},
  {text: 'הצע שאלות לדיון בכיתה שיעודדו חשיבה ביקורתית'},
  {text: 'הצע דרכים ליצור מפות חשיבה אינטראקטיביות'},
  {text: 'הצע פעילות קצרה לבדיקת הידע הקודם של התלמידים'},
  {text: 'בדוק האם הידע הנדרש מתאים לרמת התלמידים והצע התאמות'},
  {text: 'הצע דרכים לשילוב חזרה על הידע הקודם בצורה משחקית'},
  {text: 'הצע דרכים לגשר על פערי ידע אפשריים בין התלמידים'},
  {text: 'הצע התאמות לפעילויות השונות להתאמה לרמות שונות'},
  {text: 'הצע דרכים לשלב אלמנטים של משחק ותחרות'},
  {text: 'הצע רעיונות להתאמת השפה והמושגים לרמת התלמידים'},
  {text: 'הצע דרכים להתאים את משך הפעילויות ליכולת הקשב'},
  {text: 'הצע חלוקת השיעור למספר חלקים קצרים'},
  {text: 'בדוק האם הזמן שהוקצה לכל פעילות ריאלי והצע התאמות'},
  {text: 'הצע פעילויות חלופיות קצרות יותר'},
  {text: 'הצע דרכים לשלב פעילויות נוספות אם השיעור מסתיים מוקדם'}
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

export const POSITION_MAP = {
  'פתיחת נושא': 'opening',
  'הקנייה': 'teaching',
  'תרגול': 'practice',
  'סיכום נושא': 'summary'
} as const;

export const CATEGORY_MAP = {
  'מתמטיקה': 'mathematics',
  'אנגלית': 'english',
  'עברית': 'hebrew',
  'תנ״ך': 'bible',
  'היסטוריה': 'history',
  'אזרחות': 'citizenship',
  'ספרות': 'literature',
  'פיזיקה': 'physics',
  'כימיה': 'chemistry',
  'ביולוגיה': 'biology',
  'מדעים': 'science',
  'גיאוגרפיה': 'geography',
  'מחשבים': 'computers',
  'אומנות': 'art',
  'מוזיקה': 'music',
  'חינוך גופני': 'physical_education',
  'פילוסופיה': 'philosophy',
  'פסיכולוגיה': 'psychology',
  'סוציולוגיה': 'sociology',
  'חינוך חברתי': 'social_education',
  'טכנולוגיה': 'technology',
  'כלכלה': 'economics',
  'סטטיסטיקה': 'statistics',
  'פיננסים': 'finance',
  'מנהיגות': 'leadership',
  'תקשורת': 'communication',
  'ארכיטקטורה': 'architecture',
  'עיצוב': 'design',  
  'פיתוח תוכנה': 'software_development',
  'בינה מלאכותית': 'artificial_intelligence',
  'אבטחת מידע': 'cyber_security'
} as const;
