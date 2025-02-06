import React from 'react';
import { Card, CardContent } from "../../../components/ui/card.tsx";
import { Label } from "../../../components/ui/label.tsx";
import { AITextarea } from "../../../components/ui/ai-textarea.tsx";
import { Button } from "../../../components/ui/button.tsx";
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
  screenNumber 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  screenNumber: string;
}) => (
  <div>
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
      </SelectContent>
    </Select>
  </div>
);

const LessonPhase = ({
  phase,
  title,
  sections,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onSave
}: LessonPhaseProps) => {
  return (
    <Card className="mt-2 border-gray-200">
      <CardContent>
        {/* <h3 className="text-[1rem] font-normal mb-2 text-[#540ba9]">{title}</h3> */}
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
                    value={section.screens.screen1}
                    onChange={(value) => 
                      onUpdateSection(phase, index, { 
                        screens: { ...section.screens, screen1: value } 
                      })
                    }
                    screenNumber="1"
                  />
                  <ScreenTypeSelect
                    value={section.screens.screen2}
                    onChange={(value) => 
                      onUpdateSection(phase, index, { 
                        screens: { ...section.screens, screen2: value } 
                      })
                    }
                    screenNumber="2"
                  />
                  <ScreenTypeSelect
                    value={section.screens.screen3}
                    onChange={(value) => 
                      onUpdateSection(phase, index, { 
                        screens: { ...section.screens, screen3: value } 
                      })
                    }
                    screenNumber="3"
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
                <Button 
                  onClick={() => onRemoveSection(phase, index)}
                  className="text-[#681bc2] border border-[#681bc2] flex items-center justify-center gap-2"
                >
                  <TrashIcon className="h-5 w-5" />
                  מחק פעילות
                </Button>
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