import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card.tsx';
import { Input } from '../../../components/ui/input.tsx';
import { Textarea } from '../../../components/ui/textarea.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { supabase } from '../../../lib/supabase-client.ts';
// import { LessonFieldChatBox } from '../../lesson-planner/components/LessonFieldChatBox.tsx';
import type { LessonPlanSections } from '../../lesson-planner/types.ts';
import { ValidFieldNames } from './Layout.tsx';

interface LeftSidebarProps {
  saveInProgress: boolean;
  lastSaved: Date | null;
  lessonTitle?: string;
  totalSteps: number;
  lessonId?: string;
  onUpdateField: (fieldName: ValidFieldNames | Array<[string, string]>, value?: string) => Promise<void>;
  currentValues: Record<string, string>;
  saveCurrentPlan: () => Promise<void>;
  sections: LessonPlanSections;
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
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  // sections,
  lessonTitle,
  totalSteps,
  // onUpdateField,
  // createAndAddSection,
  // currentValues,
  // saveCurrentPlan,
  lessonId
}) => {
  const [materialsTitle, setMaterialsTitle] = useState("");
  const [materialsContent, setMaterialsContent] = useState("");
  const [isSavingMaterials, setIsSavingMaterials] = useState(false);

  return (
    <aside className="w-[30rem] border-r border-slate-200 shrink-0">
      <div className="fixed w-[30rem] p-6 space-y-6">
        <Card className='mb-4'>
          <CardContent className="p-4 space-y-2 bg-[#fff4fc]">
            <h3 className="font-medium text-slate-800">סטטוס שיעור</h3>
            <div className="text-sm text-slate-600">
              {lessonTitle || "ללא כותרת"}
            </div>
            <div className="text-sm text-slate-600">
              {totalSteps} שלבים
            </div>
          </CardContent>
        </Card>

        <Card className='mt-4'>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium text-slate-800">חומרי עזר</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">כותרת לחומרי עזר</label>
              <Input
                className="w-full px-3 py-2 border rounded-md"
                placeholder="הזן כותרת..."
                value={materialsTitle}
                onChange={(e) => setMaterialsTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">תוכן חומרי העזר</label>
              <Textarea
                className="w-full px-3 py-2 border rounded-md h-32 h-[calc(100vh-510px)] "
                placeholder="הזן את חומרי העזר כאן..."
                value={materialsContent}
                onChange={(e) => setMaterialsContent(e.target.value)}
              />
            </div>
            
            <Button
              className="w-full bg-[#681bc2] text-white hover:bg-[#681bc2]/90 disabled:opacity-50"
              disabled={isSavingMaterials || !materialsTitle || !materialsContent || !lessonId}
              onClick={async () => {
                try {
                  setIsSavingMaterials(true);
                  const { data: materialData } = await supabase
                    .from("materials")
                    .insert([
                      {
                        title: materialsTitle,
                        content: materialsContent
                      }
                    ])
                    .select()
                    .single();

                  if (materialData?.id && lessonId) {
                    await supabase
                      .from("lesson_plans")
                      .update({ material_id: materialData.id })
                      .eq("id", lessonId);
                      
                    setMaterialsTitle("");
                    setMaterialsContent("");
                  }
                } catch (error) {
                  console.error("שגיאה בשמירת חומרי עזר:", error);
                } finally {
                  setIsSavingMaterials(false);
                }
              }}
            >
              {isSavingMaterials ? "שומר..." : "שמור חומרי עזר"}
            </Button>
          </CardContent>
        </Card>
        
        {/* <LessonFieldChatBox
          onUpdateField={onUpdateField}
          currentValues={currentValues}
          saveCurrentPlan={saveCurrentPlan}
          createAndAddSection={createAndAddSection}
          sections={sections}
          className="h-[calc(100vh-500px)]"
        /> */}

      </div>
    </aside>
  );
};

export { LeftSidebar };
export type { LeftSidebarProps };
