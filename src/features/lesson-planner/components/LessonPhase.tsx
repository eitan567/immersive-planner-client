import React from 'react';
import { Card, CardContent } from "../../../components/ui/card.tsx";
import { Label } from "../../../components/ui/label.tsx";
import { AITextarea } from "../../../components/ui/ai-textarea.tsx";
import { Button } from "../../../components/ui/button.tsx";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../../components/ui/alert-dialog.tsx";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select.tsx";
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { LessonSection } from '../types.ts';

interface LessonPhaseProps {
  phase: 'opening' | 'main' | 'summary';
  title: string;
  sections: LessonSection[];
  onAddSection: (phase: 'opening' | 'main' | 'summary') => void;
  onUpdateSection: (phase: 'opening' | 'main' | 'summary', index: number, updates: Partial<LessonSection>) => void;
  onRemoveSection: (phase: 'opening' | 'main' | 'summary', index: number) => void;
  onSave?: () => Promise<void>;
}

const ScreenTypeSelect = ({ 
  value, 
  onChange, 
  screenNumber,
  description,
  onDescriptionChange 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  screenNumber: string;
  description?: string;
  onDescriptionChange?: (value: string) => void;
}) => (
  <div className="space-y-2">
    <Label>מסך {screenNumber}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-white">
        <SelectValue placeholder="בחר תצוגה" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="video">סרטון</SelectItem>
        <SelectItem value="image">תמונה</SelectItem>
        <SelectItem value="padlet">פדלט</SelectItem>
        <SelectItem value="website">אתר</SelectItem>
        <SelectItem value="genially">ג'ניאלי</SelectItem>
        <SelectItem value="presentation">מצגת</SelectItem>
      </SelectContent>
    </Select>
    <textarea
      value={description || ''}
      onChange={(e) => onDescriptionChange?.(e.target.value)}
      placeholder={`תיאור תצוגת מסך ${screenNumber}`}
      className="w-full h-20 p-2 text-sm border rounded-md resize-none"
      dir="rtl"
    />
  </div>
);

const LessonPhase = ({
  phase,
  sections,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onSave
}: LessonPhaseProps) => {
  return (
    <Card className="mt-2 border-gray-200">
      <CardContent>
        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card key={index} className="p-4 border-gray-200 bg-white relative">                           
              <div className="space-y-4 rtl">
                <div className="text-right">
                  <Label className="text-right text-gray-700">תוכן/פעילות</Label>
                  <div className="space-y-2">
                    <AITextarea
                      value={section.content}
                      onChange={(e) => onUpdateSection(phase, index, { content: e.target.value })}
                      placeholder="תאר את הפעילות"
                      className="text-right bg-white border-gray-200"
                      dir="rtl"
                      context={section.content}
                      fieldType="activity"
                      onSave={onSave}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <ScreenTypeSelect
                    value={section.screen1 || ''}
                    onChange={(value) => 
                      onUpdateSection(phase, index, { 
                        screen1: value
                      })
                    }
                    screenNumber="1"
                    description={section.screen1Description || ''}
                    onDescriptionChange={(value) =>
                      onUpdateSection(phase, index, {
                        screen1Description: value
                      })
                    }
                  />
                  <ScreenTypeSelect
                    value={section.screen2 || ''}
                    onChange={(value) => 
                      onUpdateSection(phase, index, { 
                        screen2: value
                      })
                    }
                    screenNumber="2"
                    description={section.screen2Description || ''}
                    onDescriptionChange={(value) =>
                      onUpdateSection(phase, index, {
                        screen2Description: value
                      })
                    }
                  />
                  <ScreenTypeSelect
                    value={section.screen3 || ''}
                    onChange={(value) => 
                      onUpdateSection(phase, index, { 
                        screen3: value
                      })
                    }
                    screenNumber="3"
                    description={section.screen3Description || ''}
                    onDescriptionChange={(value) =>
                      onUpdateSection(phase, index, {
                        screen3Description: value
                      })
                    }
                  />
                </div>

                <div>
                  <Label className="text-gray-700">שימוש במרחב הפיזי</Label>
                  <div className="space-y-2">
                    <Select
                      value={section.spaceUsage}
                      onValueChange={(value) => 
                        onUpdateSection(phase, index, { spaceUsage: value })
                      }
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="בחר סוג עבודה" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whole">מליאה</SelectItem>
                        <SelectItem value="groups">עבודה בקבוצות</SelectItem>
                        <SelectItem value="individual">עבודה אישית</SelectItem>
                        <SelectItem value="mixed">משולב</SelectItem>
                      </SelectContent>
                    </Select>                    
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="text-[#681bc2] border border-[#681bc2] flex items-center justify-center gap-2"
                    >
                      <TrashIcon className="h-5 w-5" />
                      מחק פעילות
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>מחיקת פעילות</AlertDialogTitle>
                      <AlertDialogDescription>
                        האם אתה בטוח שברצונך למחוק פעילות זו?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onRemoveSection(phase, index)}>
                        מחק
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
          <Button 
            onClick={() => onAddSection(phase)}
            className="w-full text-[#681bc2] border border-[#681bc2] flex items-center justify-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            הוסף פעילות
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonPhase;
