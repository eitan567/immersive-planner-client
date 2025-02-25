import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card.tsx';
import { Input } from '../../../components/ui/input.tsx';
import { Textarea } from '../../../components/ui/textarea.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select.tsx';
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
  lessonTitle,
  totalSteps,
  lessonId
}) => {
  const [materialsTitle, setMaterialsTitle] = useState("");
  const [materialsContent, setMaterialsContent] = useState("");
  const [isSavingMaterials, setIsSavingMaterials] = useState(false);
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [allMaterials, setAllMaterials] = useState<Array<{ id: string; title: string; content: string }>>([]);

  const loadMaterialFromId = async (materialId: string) => {
    try {
      const { data: materialData } = await supabase
        .from('materials')
        .select('*')
        .eq('id', materialId)
        .single();

      if (materialData) {
        setMaterialId(materialData.id);
        setMaterialsTitle(materialData.title || '');
        setMaterialsContent(materialData.content || '');
      }
    } catch (error) {
      console.error('שגיאה בטעינת חומרי עזר:', error);
    }
  };

  // טעינת כל חומרי העזר
  useEffect(() => {
    const loadAllMaterials = async () => {
      try {
        const { data } = await supabase
          .from('materials')
          .select('*')
          .order('title');
        
        if (data) {
          setAllMaterials(data);
        }
      } catch (error) {
        console.error('שגיאה בטעינת רשימת חומרי עזר:', error);
      }
    };

    loadAllMaterials();
  }, []);

  // טעינת חומר העזר של השיעור הנוכחי
  useEffect(() => {
    const loadCurrentMaterial = async () => {
      // First check localStorage for any current lesson plan
      const currentPlanJson = localStorage.getItem('currentLessonPlan');
      if (currentPlanJson) {
        try {
          const currentPlan = JSON.parse(currentPlanJson);
          if (currentPlan.material_id) {
            await loadMaterialFromId(currentPlan.material_id);
            return;
          }
        } catch (error) {
          console.error('Error parsing localStorage lesson plan:', error);
        }
      }

      // If no material found in localStorage, try loading from DB using lessonId
      if (lessonId) {
        try {
          const { data: lessonData } = await supabase
            .from('lesson_plans')
            .select('material_id')
            .eq('id', lessonId)
            .single();

          if (lessonData?.material_id) {
            await loadMaterialFromId(lessonData.material_id);
          }
        } catch (error) {
          console.error('שגיאה בטעינת חומרי עזר:', error);
        }
      }
    };

    loadCurrentMaterial();
  }, [lessonId]);

  const handleCleanSelection = () => {
    setMaterialId(null);
    setMaterialsTitle("");
    setMaterialsContent("");
  };

  return (
    <aside className="w-[30rem] border-r border-slate-200 shrink-0">
      <div className="fixed w-[30rem] p-6 space-y-6">        
        <Card className=''>
          <CardContent className="p-4 space-y-4 bg-[#fff4fc]">
            <div className="text-lg font-semibold text-[#681bc2]">חומרי עזר</div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">בחר חומר עזר קיים</label>
                <button 
                  onClick={handleCleanSelection}
                  className="text-sm bg-[#681bc2] text-white hover:bg-[#681bc2]/90 disabled:opacity-50 px-2 py-0.5 rounded-md"
                >
                  יצירת חומר עזר חדש
                </button>
              </div>
              
              <Select
                value={materialId || undefined}
                onValueChange={(value) => {
                  const selected = allMaterials.find(m => m.id === value);
                  if (selected) {
                    setMaterialId(selected.id);
                    setMaterialsTitle(selected.title);
                    setMaterialsContent(selected.content);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="...בחר חומר עזר" />
                </SelectTrigger>
                <SelectContent>
                  {allMaterials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">כותרת</label>
              <Input
                className="w-full px-3 py-2 border rounded-md"
                placeholder="הזן כותרת..."
                value={materialsTitle}
                onChange={(e) => setMaterialsTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">תוכן</label>
              <Textarea
                className="w-full px-3 py-2 border rounded-md h-32 h-[calc(100vh-462px)] "
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
                  let materialData;
                  
                  if (materialId) {
                    // עדכון חומרי עזר קיימים
                    const { data } = await supabase
                      .from("materials")
                      .update({
                        title: materialsTitle,
                        content: materialsContent
                      })
                      .eq('id', materialId)
                      .select()
                      .single();
                    materialData = data;
                  } else {
                    // יצירת חומרי עזר חדשים
                    const { data } = await supabase
                      .from("materials")
                      .insert([
                        {
                          title: materialsTitle,
                          content: materialsContent
                        }
                      ])
                      .select()
                      .single();
                    materialData = data;
                  }

                  if (materialData?.id && lessonId) {
                    await supabase
                      .from("lesson_plans")
                      .update({ material_id: materialData.id })
                      .eq("id", lessonId);
                      
                    if (materialData) {
                      setMaterialId(materialData.id);
                    }

                    // רענון רשימת חומרי העזר
                    const { data: updatedMaterials } = await supabase
                      .from('materials')
                      .select('*')
                      .order('title');
                    
                    if (updatedMaterials) {
                      setAllMaterials(updatedMaterials);
                    }
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
      </div>
    </aside>
  );
};

export { LeftSidebar };
export type { LeftSidebarProps };
