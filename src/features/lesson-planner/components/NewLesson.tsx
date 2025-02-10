import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.tsx';
import { Layout } from '../../common/components/Layout.tsx';
import { Label } from '../../../components/ui/label.tsx';
import { Input } from '../../../components/ui/input.tsx';
import { Button } from '../../../components/ui/button.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select.tsx';
import { LessonCategory, LESSON_CATEGORIES } from '../types.ts';
import { lessonPlanService } from '../services/lessonPlanService.ts';
import { LoadingSpinner } from '../../../components/ui/loading-spinner.tsx';
import { useAILesson } from '../hooks/useAILesson.ts';
import { SavePrompt } from './SavePrompt.tsx';

interface LocationState {
  isAIMode: boolean;
  initialData?: {
    topic: string;
    materials: string;
    category: LessonCategory;
  };
}

export function NewLesson() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAIMode, initialData } = (location.state as LocationState) || {};
  
  const [topic, setTopic] = useState(initialData?.topic || '');
  const [category, setCategory] = useState<string>(initialData?.category || '');
  const [materials, setMaterials] = useState(initialData?.materials || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const handleAISuccess = useCallback(async (generatedPlan: any) => {
    try {
      // Update the lesson plan with AI-generated content
      const updatedPlan = await lessonPlanService.updateLessonPlan(
        generatedPlan.id,
        {
          ...generatedPlan,
          status: 'draft',
        }
      );

      navigate(`/lesson/${updatedPlan.id}`);
    } catch (err) {
      setError('Failed to update lesson with AI content');
      console.error(err);
    }
  }, [navigate]);

  const handleAIError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  }, []);

  const { generateLesson, isGenerating } = useAILesson({
    onSuccess: handleAISuccess,
    onError: handleAIError,
  });

  const handleBack = () => {
    if (hasChanges) {
      setPendingNavigation('/');
      setShowSavePrompt(true);
    } else {
      navigate('/');
    }
  };

  const handleCreate = async () => {
    if (!topic.trim()) {
      setError('נושא היחידה הוא שדה חובה');
      return;
    }

    if (!category) {
      setError('קטגוריה היא שדה חובה');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const lessonPlan = await lessonPlanService.createLessonPlan({
        userId: user!.id,
        topic: topic.trim(),
        duration: '',
        gradeLevel: '',
        priorKnowledge: '',
        position: '',
        contentGoals: '',
        skillGoals: '',
        sections: {
          opening: [],
          main: [],
          summary: []
        },
        status: 'draft',
        description: '',
        basicInfo: {
          title: topic.trim(),
          duration: '',
          gradeLevel: '',
          priorKnowledge: '',
          contentGoals: '',
          skillGoals: ''
        },
        category: category as LessonCategory
      });

      if (!isAIMode) {
        navigate(`/lesson/${lessonPlan.id}`);
      } else {
        // Generate AI content for the lesson
        await generateLesson({
          topic,
          category,
          materials: materials || undefined
        });
      }
    } catch (err) {
      setError('יצירת השיעור נכשלה');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Track changes in form fields
  useEffect(() => {
    if (topic || category || (isAIMode && materials)) {
      setHasChanges(true);
    }
  }, [topic, category, materials, isAIMode]);

  const handleSave = async () => {
    await handleCreate();
  };

  const handleDiscard = () => {
    setShowSavePrompt(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  if (!user) return null;

  const isProcessing = isLoading || isGenerating;

  return (
    <Layout 
      user={user} 
      mode="new" 
      rightSidebarProps={{}}
    >
      <div className="container mx-auto p-6 max-w-2xl" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#540ba9]">
            {isAIMode ? 'יצירת שיעור בעזרת AI' : 'יצירת שיעור חדש'}
          </h1>
          <Button 
            variant="ghost"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800"
          >
            חזרה
          </Button>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <Label className="text-base">נושא היחידה *</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="הכנס את נושא היחידה"
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-base">קטגוריה *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                {LESSON_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAIMode && (
            <div>
              <Label className="text-base">חומרי למידה</Label>
              <textarea
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="הכנס חומרי למידה עבור ה-AI"
                className="w-full mt-2 min-h-[150px] p-3 border rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">
                המודל ישתמש בחומרים אלו ליצירת תוכן השיעור
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
              {error}
            </div>
          )}

          <Button
            onClick={handleCreate}
            className="w-full bg-[#681bc2] hover:bg-[#681bc2]/90 text-white"
            disabled={isProcessing}
          >
            {isProcessing ? <LoadingSpinner /> : (
              isAIMode ? 'צור שיעור באמצעות AI' : 'צור שיעור'
            )}
          </Button>
        </div>
      </div>
      <SavePrompt
        open={showSavePrompt}
        onClose={() => setShowSavePrompt(false)}
        onDiscard={handleDiscard}
        onSave={handleSave}
      />
    </Layout>
  );
}
