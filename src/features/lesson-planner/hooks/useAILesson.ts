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

      // First ensure old data is cleared
      localStorage.removeItem('currentLessonPlanId');
      
      console.log('AI Response:', aiResponse);
      console.log('Complete Lesson Plan before storage:', completeLessonPlan);
      
      // Store the complete plan
      localStorage.setItem('currentLessonPlan', JSON.stringify(completeLessonPlan));
      
      // Verify what was stored
      const storedPlan = localStorage.getItem('currentLessonPlan');
      console.log('Stored plan from localStorage:', storedPlan);
      console.log('Parsed stored plan:', storedPlan ? JSON.parse(storedPlan) : null);
      
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
