import { useState } from 'react';
import { generateFullLesson } from '../services/aiLessonService.ts';
import type { LessonCategory, LessonPlan } from '../types.ts';

interface UseAILessonProps {
  onSuccess: (lessonPlan: LessonPlan) => void;
  onError: (error: string) => void;
}

export function useAILesson({ onSuccess, onError }: UseAILessonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLesson = async (data: {
    topic: string;
    materials?: string;
    category: LessonCategory;
  }) => {
    try {
      setIsGenerating(true);

      const aiResponse = await generateFullLesson({
        topic: data.topic,
        materials: data.materials,
        category: data.category
      });

      // Explicitly set all fields to ensure proper initialization
      const completeLessonPlan: LessonPlan = {
        // User provided fields
        id: '',
        userId: '',
        topic: data.topic,
        category: data.category,
        basicInfo: {
          title: data.topic,
          duration: aiResponse.duration || '90 דקות',
          gradeLevel: aiResponse.gradeLevel || 'ט\'-יב\'',
          priorKnowledge: aiResponse.priorKnowledge || '',
          contentGoals: aiResponse.contentGoals || '',
          skillGoals: aiResponse.skillGoals || ''
        },

        // AI generated fields with defaults
        duration: aiResponse.duration || '90 דקות',
        gradeLevel: aiResponse.gradeLevel || 'ט\'-יב\'',
        priorKnowledge: aiResponse.priorKnowledge || '',
        position: aiResponse.position || 'פתיחת נושא',
        contentGoals: aiResponse.contentGoals || '',
        skillGoals: aiResponse.skillGoals || '',
        description: aiResponse.description || '',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),

        // Sections from AI response (already has proper structure from aiLessonService)
        sections: aiResponse.sections || {
          opening: [],
          main: [],
          summary: []
        }
      };

      // First ensure old data is cleared
      localStorage.removeItem('currentLessonPlanId');
      
      // Store the complete plan
      localStorage.setItem('currentLessonPlan', JSON.stringify(completeLessonPlan));
      
      // Add a small delay before navigation to ensure storage is complete
      setTimeout(() => {
        onSuccess(completeLessonPlan);
      }, 100);
      
    } catch (error) {
      let errorMessage = 'Failed to generate lesson';
      
      if (error instanceof Error) {
        if (error.message.includes('Resource has been exhausted') ||
            error.message.includes('quota')) {
          errorMessage = 'המערכת לא זמינה כרגע. אנא נסה שוב מאוחר יותר או פנה למנהל המערכת.';
        } else if (error.message.includes('Invalid response format')) {
          errorMessage = 'התקבלה תשובה לא תקינה מהשרת. אנא נסה שוב.';
        } else {
          errorMessage = error.message;
        }
      }
      
      onError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateLesson,
    isGenerating,
  };
}
