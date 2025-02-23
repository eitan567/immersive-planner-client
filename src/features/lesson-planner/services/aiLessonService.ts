import { useMcpTool } from '../../../hooks/useMcp.ts';
import type { LessonPlan, LessonCategory } from '../types.ts';
import { FIELD_LABELS } from '../components/chat/types.ts';

interface GenerateFullLessonParams {
  topic: string;
  materials?: string;
  category: LessonCategory;
}

interface AIGeneratedSection {
  content: string;
  spaceUsage: string;
  screen1?: string;
  screen2?: string;
  screen3?: string;
  screen1Description?: string;
  screen2Description?: string;
  screen3Description?: string;
}

interface AILessonResponse {
  duration?: string;
  gradeLevel?: string;
  priorKnowledge?: string;
  position?: string;
  contentGoals?: string;
  skillGoals?: string;
  description?: string;
  sections?: {
    opening?: AIGeneratedSection[];
    main?: AIGeneratedSection[];
    summary?: AIGeneratedSection[];
  };
}

function tryParseJSON(text: string): any {
  try {
    // First try parsing as is
    return JSON.parse(text);
  } catch (e) {
    try {
      // Try to find the last complete object by looking for the last closing brace
      const lastBrace = text.lastIndexOf('}');
      if (lastBrace > -1) {
        const truncatedText = text.substring(0, lastBrace + 1);
        return JSON.parse(truncatedText);
      }
    } catch (e2) {
      // If both attempts fail, throw the original error
      throw e;
    }
    throw e;
  }
}

export async function generateFullLesson({ 
  topic, 
  materials,
  category 
}: GenerateFullLessonParams): Promise<Partial<LessonPlan>> {
  try {
    const response = await useMcpTool({
      serverName: 'ai-server',
      toolName: 'generate_full_lesson',
      arguments: {
        topic,
        materials,
        category,
        fieldLabels: FIELD_LABELS
      }
    });

    if ('error' in response) {
      throw new Error(response.error);
    }

    const responseText = response.content?.[0]?.text;
    if (!responseText) {
      throw new Error('No response received from server');
    }

    // Try to parse potentially incomplete JSON
    const aiResponse = tryParseJSON(responseText) as AILessonResponse;
    
    // Validate and provide defaults for essential fields
    if (!aiResponse || typeof aiResponse !== 'object') {
      throw new Error('Invalid response format from AI server');
    }

    // Return only the AI-generated fields
    return {
      duration: aiResponse.duration || '',
      gradeLevel: aiResponse.gradeLevel || '',
      priorKnowledge: aiResponse.priorKnowledge || '',
      position: aiResponse.position || '',
      contentGoals: aiResponse.contentGoals || '',
      skillGoals: aiResponse.skillGoals || '',
      description: aiResponse.description || '',
      // Sections need UUIDs for each section
      sections: {
        opening: Array.isArray(aiResponse.sections?.opening) 
          ? aiResponse.sections.opening.map(section => ({
            id: crypto.randomUUID(),
            content: section.content || '',
            spaceUsage: section.spaceUsage || 'מליאה',
            screen1: section.screen1 || '',
            screen2: section.screen2 || '',
            screen3: section.screen3 || '',
            screen1Description: section.screen1Description || '',
            screen2Description: section.screen2Description || '',
            screen3Description: section.screen3Description || ''
          })) 
          : [],
        main: Array.isArray(aiResponse.sections?.main) 
          ? aiResponse.sections.main.map(section => ({
            id: crypto.randomUUID(),
            content: section.content || '',
            spaceUsage: section.spaceUsage || 'מליאה',
            screen1: section.screen1 || '',
            screen2: section.screen2 || '',
            screen3: section.screen3 || '',
            screen1Description: section.screen1Description || '',
            screen2Description: section.screen2Description || '',
            screen3Description: section.screen3Description || ''
          }))
          : [],
        summary: Array.isArray(aiResponse.sections?.summary) 
          ? aiResponse.sections.summary.map(section => ({
            id: crypto.randomUUID(),
            content: section.content || '',
            spaceUsage: section.spaceUsage || 'מליאה',
            screen1: section.screen1 || '',
            screen2: section.screen2 || '',
            screen3: section.screen3 || '',
            screen1Description: section.screen1Description || '',
            screen2Description: section.screen2Description || '',
            screen3Description: section.screen3Description || ''
          }))
          : []
      }
    };
  } catch (error) {
    console.error('Failed to generate lesson:', error);
    throw error;
  }
}