import { useState } from 'react';

interface UseAILessonProps {
  onSuccess: (lessonPlan: any) => void;
  onError: (error: string) => void;
}

export function useAILesson({ onSuccess, onError }: UseAILessonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLesson = async (data: {
    topic: string;
    materials?: string;
    category: string;
  }) => {
    try {
      setIsGenerating(true);

      // TODO: Replace with actual API call to your AI endpoint
      const response = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to generate lesson');
      }

      const lessonPlan = await response.json();
      onSuccess(lessonPlan);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to generate lesson');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateLesson,
    isGenerating,
  };
}
