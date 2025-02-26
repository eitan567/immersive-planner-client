import React, { useState, useEffect } from 'react';
import { materialsService } from '../services/materialsService.ts';
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

const validFields = [
  'topic',
  'duration',
  'gradeLevel',
  'priorKnowledge',
  'position',
  'contentGoals',
  'skillGoals',
  'category',
  'description'
] as const;

type BasicInfoFormProps = {
  lessonPlan: Pick<LessonPlan, 'topic' | 'duration' | 'priorKnowledge' | 'gradeLevel' | 'contentGoals' | 'skillGoals' | 'position' | 'category' | 'description' | 'material_id'>;
  handleBasicInfoChange: (field: typeof validFields[number], value: string) => void;
  onSave?: () => Promise<void>;
  validateRef?: React.MutableRefObject<(() => boolean) | undefined>;
  materials?: { title: string; content: string } | string;
};

export const BasicInfoForm = ({ lessonPlan, handleBasicInfoChange, onSave, validateRef, materials }: BasicInfoFormProps) => {
  const [validationErrors, setValidationErrors] = useState<{
    topic?: string;
    category?: string;
  }>({});
  
  const [materialContent, setMaterialContent] = useState<string>('');
  
  // טעינת חומרי העזר אם קיימים
  useEffect(() => {
    const loadMaterial = async () => {
      if (!lessonPlan.material_id) return;
      try {
        const material = await materialsService.getMaterial(lessonPlan.material_id);
        if (material) {
          setMaterialContent(material.title ? `${material.title}\n${material.content}` : material.content);
        }
      } catch (error) {
        console.error('Failed to load material:', error);
      }
    };
    loadMaterial();
  }, [lessonPlan.material_id]);

  const handleChange = (field: typeof validFields[number]) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { currentTarget: { value: string } }
  ) => {
    handleBasicInfoChange(field, e.currentTarget.value);
    
    // Clear validation error when field is filled
    if (validationErrors[field as 'topic' | 'category']) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateField = (field: 'topic' | 'category') => {
    if (!lessonPlan[field] || lessonPlan[field].trim() === '') {
      setValidationErrors(prev => ({
        ...prev,
        [field]: `${field === 'topic' ? 'נושא היחידה' : 'קטגוריה'} הוא שדה חובה`
      }));
      return false;
    }
    return true;
  };

  const validate = React.useCallback(() => {
    // Always validate both fields to show all errors
    const isTopicValid = validateField('topic');
    const isCategoryValid = validateField('category');
    return isTopicValid && isCategoryValid;
  }, [lessonPlan]); // Depend on lessonPlan to re-create when values change

  // Expose validate function through ref
  React.useEffect(() => {
    if (validateRef) {
      validateRef.current = validate;
    }
    return () => {
      if (validateRef) {
        validateRef.current = undefined;
      }
    };
  }, [validateRef, validate]);

  return (
    <div className="space-y-2 rtl">
      <h1 className="text-[1.2rem] font-semibold text-[--theme-color-1] py-4">פרטי השיעור</h1>
      
      <div className="text-right">
        <Label className="text-right">תיאור כללי</Label>
        <div className="space-y-2">
          <AIInput
            value={lessonPlan.description}
            onChange={handleChange('description')}
            placeholder="הכנס תיאור כללי"
            className="text-right"
            dir="rtl"
            context={materials ? typeof materials === 'string' ? materials : materials.content : lessonPlan.topic}
            fieldType="description"
            materials={materials}
          />          
        </div>
      </div>
{/*       
      
      {lessonPlan.description && (
        <>
        <Label className="text-right">תיאור כללי</Label>
        <div className="bg-white p-3 py-2 rounded-lg border border-input mb-4 text-right text-sm">{lessonPlan.description}</div>
        </>
      )} */}

      <div className="text-right">
        <Label className="text-right">קטגוריה *</Label>
        <div className="space-y-2">
          <Select 
            value={lessonPlan.category || ''} 
            onValueChange={(value) => handleBasicInfoChange('category', value)}
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
          {validationErrors.category && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.category}</p>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <Label className="text-right">נושא היחידה *</Label>
        <div className="space-y-2">
          <AIInput
            value={lessonPlan.topic}
            onChange={handleChange('topic')}
            placeholder="הכנס את נושא היחידה"
            className="text-right"
            dir="rtl"
            context={lessonPlan.topic}
            fieldType="topic"
            materials={materials}
          />
          {validationErrors.topic && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.topic}</p>
          )}
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
            materials={materials}
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
            materials={materials}
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
            materials={materials}
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
            materials={materials}
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
            materials={materials}
          />
        </div>
      </div>

      {materialContent && (
        <div className="text-right mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <Label className="text-right font-semibold text-[#fa4083]">חומרי עזר</Label>
          <div className="mt-2 whitespace-pre-wrap text-gray-700">{materialContent}</div>
        </div>
      )}
    </div>
  );
};

export default BasicInfoForm;
