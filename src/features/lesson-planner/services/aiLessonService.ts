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
    // Try to extract JSON object using regex
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON object found in response');
    }
    // Parse the matched JSON
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('Failed to parse JSON:', text);
    throw new Error('Invalid response format from AI server');
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
    
    console.log('[AI Service] Raw response from server:', responseText);

    // Try to parse potentially incomplete JSON
    const aiResponse = tryParseJSON(responseText) as AILessonResponse;
    console.log('[AI Service] Parsed AI response:', aiResponse);
    
    // Validate and provide defaults for essential fields
    if (!aiResponse || typeof aiResponse !== 'object') {
      throw new Error('Invalid response format from AI server');
    }

    // Create a function to map sections with proper validation

    // Create a function to map sections with proper validation
    const mapSection = (section: AIGeneratedSection) => ({
      id: crypto.randomUUID(),
      content: section.content || '',
      spaceUsage: section.spaceUsage || 'מליאה',
      screen1: section.screen1 || '',
      screen2: section.screen2 || '',
      screen3: section.screen3 || '',
      screen1Description: section.screen1Description || '',
      screen2Description: section.screen2Description || '',
      screen3Description: section.screen3Description || ''
    });

    // Ensure sections exist and have proper structure
    const sections = aiResponse.sections || { opening: [], main: [], summary: [] };
    
    // Prepare the processed response
    const processedResponse = {
      duration: aiResponse.duration || '',
      gradeLevel: aiResponse.gradeLevel || '',
      priorKnowledge: aiResponse.priorKnowledge || '',
      position: aiResponse.position || '',
      contentGoals: aiResponse.contentGoals || '',
      skillGoals: aiResponse.skillGoals || '',
      description: aiResponse.description || '',
      sections: {
        opening: Array.isArray(sections.opening) ? sections.opening.map(mapSection) : [],
        main: Array.isArray(sections.main) ? sections.main.map(mapSection) : [],
        summary: Array.isArray(sections.summary) ? sections.summary.map(mapSection) : []
      }
    };

    console.log('[AI Service] Processed response with defaults:', processedResponse);
    return processedResponse;
  } catch (error) {
    console.error('Failed to generate lesson:', error);
    throw error;
  }
}
