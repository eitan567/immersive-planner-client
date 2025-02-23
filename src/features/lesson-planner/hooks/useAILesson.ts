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
      // Create the lesson plan
      console.log('[AI Hook] AI Response before processing:', aiResponse);

      const completeLessonPlan: LessonPlan = {
        // Form Data
        topic: data.topic,
        category: data.category,
        duration: aiResponse.duration || '',
        gradeLevel: aiResponse.gradeLevel || '',
        priorKnowledge: aiResponse.priorKnowledge || '',
        position: aiResponse.position || '',
        contentGoals: aiResponse.contentGoals || '',
        skillGoals: aiResponse.skillGoals || '',
        sections: aiResponse.sections || {
          opening: [],
          main: [],
          summary: []
        },
        
        // System/DB fields
        id: '',
        userId: '',
        status: 'draft',
        description: aiResponse.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('[AI Hook] Complete lesson plan created:', completeLessonPlan);

      console.log('[AI Hook] Processing AI response...');
      
      // Ensure sections are properly initialized
      const validatedPlan = {
        ...completeLessonPlan,
        sections: {
          opening: Array.isArray(completeLessonPlan.sections?.opening) ? completeLessonPlan.sections.opening : [],
          main: Array.isArray(completeLessonPlan.sections?.main) ? completeLessonPlan.sections.main : [],
          summary: Array.isArray(completeLessonPlan.sections?.summary) ? completeLessonPlan.sections.summary : []
        }
      };
      
      console.log('[AI Hook] Validated plan before storage:', validatedPlan);

      // Store the validated plan first
      const planJson = JSON.stringify(validatedPlan);
      console.log('[AI Hook] Storing new plan in localStorage:', planJson);

      // Clear any existing data after preparing the new plan
      localStorage.removeItem('currentLessonPlanId');
      localStorage.setItem('currentLessonPlan', planJson);
      console.log('[AI Hook] Successfully stored new plan');
      
      // Call success callback with validated plan
      onSuccess(validatedPlan);
      
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
