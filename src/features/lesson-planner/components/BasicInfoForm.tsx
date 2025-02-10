import React from 'react';
import { Input } from "../../../components/ui/input.tsx";
import { Label } from "../../../components/ui/label.tsx";
import { AIInput } from "../../../components/ui/ai-input.tsx";
import { AITextarea } from "../../../components/ui/ai-textarea.tsx";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../../components/ui/select.tsx";
import type { LessonPlan, LessonCategory } from '../types.ts';
import { LESSON_CATEGORIES } from '../types.ts';

type BasicInfoFormProps = {
  lessonPlan: Pick<LessonPlan, 'topic' | 'duration' | 'priorKnowledge' | 'gradeLevel' | 'contentGoals' | 'skillGoals' | 'position' | 'category'>;
  handleBasicInfoChange: (field: keyof LessonPlan, value: string) => void;
  onSave?: () => Promise<void>;
};

export const BasicInfoForm = ({ lessonPlan, handleBasicInfoChange, onSave }: BasicInfoFormProps) => {
  const handleChange = (field: keyof LessonPlan) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { currentTarget: { value: string } }
  ) => {
    handleBasicInfoChange(field, e.currentTarget.value);
  };

  return (
    <div className="space-y-2 rtl">
      <h1 className="text-[1.2rem] font-semibold text-[#540ba9] pb-[10px] pt-[23px]">פרטי השיעור</h1>
      <div className="text-right">
        <Label className="text-right">קטגוריה *</Label>
        <div className="space-y-2">
          <Select 
            value={lessonPlan.category} 
            onValueChange={(value) => handleBasicInfoChange('category', value)}
            required
          >
            <SelectTrigger className="text-right">
              <SelectValue placeholder="בחר קטגוריה" />
            </SelectTrigger>
            <SelectContent>
              {LESSON_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="text-right">
        <Label className="text-right">נושא היחידה</Label>
        <div className="space-y-2">
          <AIInput
            value={lessonPlan.topic}
            onChange={handleChange('topic')}
            placeholder="הכנס את נושא היחידה"
            className="text-right"
            dir="rtl"
            context={lessonPlan.topic}
            fieldType="topic"
            onSave={onSave}
          />
        </div>
      </div>
      
      <div className="text-right">
        <Label className="text-right">זמן כולל</Label>
        <div className="space-y-2">
          <AIInput
            value={lessonPlan.duration}
            onChange={handleChange('duration')}
            placeholder="משך השיעור"
            className="text-right"
            dir="rtl"
            context={lessonPlan.duration}
            fieldType="duration"
            onSave={onSave}
          />          
        </div>
      </div>

      <div className="text-right">
        <Label className="text-right">שכבת גיל</Label>
        <div className="space-y-2">
          <AIInput
            value={lessonPlan.gradeLevel}
            onChange={handleChange('gradeLevel')}
            placeholder="הכנס שכבת גיל"
            className="text-right"
            dir="rtl"
            context={lessonPlan.gradeLevel} 
            fieldType="gradeLevel"
            onSave={onSave}
          />          
        </div>
      </div>

      <div className="text-right">
        <Label className="text-right">ידע קודם נדרש</Label>
        <div className="space-y-2">
          <AITextarea
            value={lessonPlan.priorKnowledge}
            onChange={handleChange('priorKnowledge')}
            placeholder="פרט את הידע הקודם הנדרש"
            className="text-right"
            dir="rtl"
            context={lessonPlan.priorKnowledge}
            fieldType="priorKnowledge"
            onSave={onSave}
          />
        </div>
      </div>

      <div className="text-right">
        <Label className="text-right">מיקום בתוכן</Label>
        <Select
          value={lessonPlan.position}
          onValueChange={(value) => handleBasicInfoChange('position', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="בחר מיקום" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opening">פתיחת נושא</SelectItem>
            <SelectItem value="teaching">הקנייה</SelectItem>
            <SelectItem value="practice">תרגול</SelectItem>
            <SelectItem value="summary">סיכום נושא</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-right">
        <Label className="text-right">מטרות ברמת התוכן</Label>
        <div className="space-y-2">
          <AITextarea
            value={lessonPlan.contentGoals}
            onChange={handleChange('contentGoals')}
            placeholder="פרט את מטרות התוכן"
            className="text-right"
            dir="rtl"
            context={lessonPlan.contentGoals}
            fieldType="contentGoals"
            onSave={onSave}
          />
        </div>
      </div>

      <div className="text-right">
        <Label className="text-right">מטרות ברמת המיומנויות</Label>
        <div className="space-y-2">
          <AITextarea
            value={lessonPlan.skillGoals}
            onChange={handleChange('skillGoals')}
            placeholder="פרט את מטרות המיומנויות"
            className="text-right"
            dir="rtl"
            context={lessonPlan.skillGoals}
            fieldType="skillGoals"
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
