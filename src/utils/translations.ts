// translations.ts
export const POSITION_TRANSLATIONS = {
  "opening": "פתיחת נושא",
  "teaching": "הקנייה",
  "practice": "תרגול",
  "summary": "סיכום נושא"
};

export const SPACE_USAGE_TRANSLATIONS = {
  "whole": "מליאה",
  "groups": "עבודה בקבוצות",
  "individual": "עבודה אישית",
  "mixed": "משולב"
};

export const SCREEN_TYPE_TRANSLATIONS = {
  "video": "סרטון",
  "image": "תמונה",
  "padlet": "פדלט",
  "website": "אתר",
  "genially": "ג'ניאלי",
  "presentation": "מצגת"
};

export const CATEGORY_TRANSLATIONS = {
  "mathematics": "מתמטיקה",
  "english": "אנגלית",
  "hebrew": "עברית",
  "bible": "תנ״ך",
  "history": "היסטוריה",
  "citizenship": "אזרחות",
  "literature": "ספרות",
  "physics": "פיזיקה",
  "chemistry": "כימיה",
  "biology": "ביולוגיה",
  "science": "מדעים",
  "geography": "גיאוגרפיה",
  "computers": "מחשבים",
  "art": "אומנות",
  "music": "מוזיקה",
  "physical_education": "חינוך גופני",
  "philosophy": "פילוסופיה",
  "psychology": "פסיכולוגיה",
  "sociology": "סוציולוגיה",
  "social_education": "חינוך חברתי",
  "technology": "טכנולוגיה",
  "economics": "כלכלה",
  "statistics": "סטטיסטיקה",
  "finance": "פיננסים",
  "leadership": "מנהיגות",
  "communication": "תקשורת",
  "architecture": "ארכיטקטורה",
  "design": "עיצוב",
  "software_development": "פיתוח תוכנה",
  "artificial_intelligence": "בינה מלאכותית",
  "cyber_security": "אבטחת מידע"
};

export const FIELD_TRANSLATIONS = {
  "topic": "נושא היחידה"
};

export const translateContent = (text: string): string => {
  let newText = text;
  Object.entries(POSITION_TRANSLATIONS).forEach(([eng, heb]) => {
    newText = newText.replace(new RegExp(`\\b${eng}\\b`, "g"), heb);
  });
  Object.entries(SPACE_USAGE_TRANSLATIONS).forEach(([eng, heb]) => {
    newText = newText.replace(new RegExp(`\\b${eng}\\b`, "g"), heb);
  });
  Object.entries(SCREEN_TYPE_TRANSLATIONS).forEach(([eng, heb]) => {
    newText = newText.replace(new RegExp(`\\b${eng}\\b`, "g"), heb);
  });
  Object.entries(CATEGORY_TRANSLATIONS).forEach(([eng, heb]) => {
    newText = newText.replace(new RegExp(`\\b${eng}\\b`, "g"), heb);
  });
  Object.entries(FIELD_TRANSLATIONS).forEach(([eng, heb]) => {
    newText = newText.replace(new RegExp(`\\b${eng}\\b`, "gi"), heb);
  });
  return newText;
};
