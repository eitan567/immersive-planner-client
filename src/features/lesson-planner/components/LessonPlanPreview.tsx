import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card.tsx";
import { AITextarea } from "../../../components/ui/ai-textarea.tsx";

const POSITION_TRANSLATIONS = {
  "opening": "פתיחת נושא",
  "teaching": "הקנייה",
  "practice": "תרגול",
  "summary": "סיכום נושא"
};

const SPACE_USAGE_TRANSLATIONS = {
  "whole": "מליאה",
  "groups": "עבודה בקבוצות",
  "individual": "עבודה אישית",
  "mixed": "משולב"
};

const SCREEN_TYPE_TRANSLATIONS = {
  "video": "סרטון",
  "image": "תמונה",
  "padlet": "פדלט",
  "website": "אתר",
  "genially": "ג'ניאלי",
  "presentation": "מצגת"
};

const CATEGORY_TRANSLATIONS = {
  "mathematics": "מתמטיקה",
  "english": "אנגלית",
  "hebrew": "עברית",
  "bible": "תנ״ך",
  "history": "היסטוריה",
  "civics": "אזרחות",
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
  "social_education": "חינוך חברתי"
};

const FIELD_TRANSLATIONS = {
  "topic": "נושא היחידה"
};

const translateContent = (text: string): string => {
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

interface LessonPlanPreviewProps {
  content: string;
  onContentChange?: (newContent: string) => void;
}

const LessonPlanPreview = ({ content: initialContent, onContentChange }: LessonPlanPreviewProps) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(translateContent(initialContent));
  }, [initialContent]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
  };

  return (
    <Card className="mt-4 border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-right flex items-center justify-end gap-2 text-gray-800">
          <h1 className="text-[1.2rem] font-semibold text-[#540ba9] pb-[10px] pt-[23px]">תצוגה מקדימה של תכנית השיעור</h1>
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white h-[calc(100vh-380px)] min-h-[380px]">
        <AITextarea
          aiOn={false}
          value={content}
          onChange={handleContentChange}
          dir="rtl"
          className="w-full min-h-[320px] h-[calc(100vh-450px)] text-right font-['Varela_Round'] text-[1.05rem] leading-7 
            bg-gray-50 p-6 rounded-lg border border-gray-100 
            text-gray-700 resize-y
            focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200
            transition-all duration-200"
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
