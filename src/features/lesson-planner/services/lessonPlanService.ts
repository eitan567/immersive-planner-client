import { dbOperation } from '../../../lib/supabase-client.ts';
import type { LessonPlan, LessonPlanSections, LessonSection } from '../types.ts';
import type { Database } from '../../../lib/database.types.ts';
import type { Json } from '../../../lib/database.types.ts';

type DbLessonPlan = Database['public']['Tables']['lesson_plans']['Row'];

const createEmptySections = (): LessonPlanSections => ({
  opening: [],
  main: [],
  summary: []
});

const validateLessonPlanSections = (json: Json): LessonPlanSections => {
  try {
    if (!json || typeof json !== 'object') {
      return createEmptySections();
    }

    const data = json as Record<string, unknown>;
    
    if (!data.opening || !data.main || !data.summary || 
        !Array.isArray(data.opening) || !Array.isArray(data.main) || !Array.isArray(data.summary)) {
      return createEmptySections();
    }

    // At this point, we know we have arrays for each section
    const result: LessonPlanSections = {
      opening: [],
      main: [],
      summary: []
    };

    const processSections = (sections: unknown[]): LessonSection[] => {
      return sections.map(section => {
        if (!section || typeof section !== 'object') {
          return {
            id: crypto.randomUUID(),
            content: '',
            screens: { 
              screen1: '', 
              screen2: '', 
              screen3: '',
              screen1Description: '',
              screen2Description: '',
              screen3Description: ''
            },
            spaceUsage: ''
          };
        }

        const s = section as Record<string, unknown>;
        return {
          id: typeof s.id === 'string' ? s.id : crypto.randomUUID(),
          content: typeof s.content === 'string' ? s.content : '',
          spaceUsage: typeof s.spaceUsage === 'string' ? s.spaceUsage : '',
          screens: {
            screen1: s.screens && typeof s.screens === 'object' ? String((s.screens as any).screen1 || '') : '',
            screen2: s.screens && typeof s.screens === 'object' ? String((s.screens as any).screen2 || '') : '',
            screen3: s.screens && typeof s.screens === 'object' ? String((s.screens as any).screen3 || '') : '',
            screen1Description: s.screens && typeof s.screens === 'object' ? String((s.screens as any).screen1Description || '') : '',
            screen2Description: s.screens && typeof s.screens === 'object' ? String((s.screens as any).screen2Description || '') : '',
            screen3Description: s.screens && typeof s.screens === 'object' ? String((s.screens as any).screen3Description || '') : ''
          }
        };
      });
    };    

    result.opening = processSections(data.opening);
    result.main = processSections(data.main);
    result.summary = processSections(data.summary);

    return result;
  } catch (error) {
    console.error('Error validating lesson plan sections:', error);
    return createEmptySections();
  }
};

// Convert database lesson plan to application lesson plan
const toAppLessonPlan = (dbPlan: DbLessonPlan): LessonPlan => {
  const sections = validateLessonPlanSections(dbPlan.sections);
  
  // Transform sections to include both flat screen properties and nested screens object
  const transformedSections: LessonPlanSections = {
    opening: sections.opening.map(section => ({
      ...section,
      screen1: section.screens?.screen1 || '',
      screen2: section.screens?.screen2 || '',
      screen3: section.screens?.screen3 || '',
      screen1Description: section.screens?.screen1Description || '',
      screen2Description: section.screens?.screen2Description || '',
      screen3Description: section.screens?.screen3Description || ''
    })),
    main: sections.main.map(section => ({
      ...section,
      screen1: section.screens?.screen1 || '',
      screen2: section.screens?.screen2 || '',
      screen3: section.screens?.screen3 || '',
      screen1Description: section.screens?.screen1Description || '',
      screen2Description: section.screens?.screen2Description || '',
      screen3Description: section.screens?.screen3Description || ''
    })),
    summary: sections.summary.map(section => ({
      ...section,
      screen1: section.screens?.screen1 || '',
      screen2: section.screens?.screen2 || '',
      screen3: section.screens?.screen3 || '',
      screen1Description: section.screens?.screen1Description || '',
      screen2Description: section.screens?.screen2Description || '',
      screen3Description: section.screens?.screen3Description || ''
    }))
  };

  return {
    id: dbPlan.id,
    userId: dbPlan.user_id,
    topic: dbPlan.topic,
    duration: dbPlan.duration,
    gradeLevel: dbPlan.grade_level,
    priorKnowledge: dbPlan.prior_knowledge || '',
    position: dbPlan.position,
    contentGoals: dbPlan.content_goals || '',
    skillGoals: dbPlan.skill_goals || '',
    sections: transformedSections,
    created_at: dbPlan.created_at,
    updated_at: dbPlan.updated_at,
    status: dbPlan.status as 'draft' | 'published' || 'draft',
    description: dbPlan.description || '',
    basicInfo: {
      title: dbPlan.topic,
      duration: dbPlan.duration,
      gradeLevel: dbPlan.grade_level,
      priorKnowledge: dbPlan.prior_knowledge || '',
      contentGoals: dbPlan.content_goals || '',
      skillGoals: dbPlan.skill_goals || ''
    },
    category: dbPlan.category
  };
};

// Convert application lesson plan to database format
const toDbLessonPlan = (plan: Omit<LessonPlan, 'id' | 'created_at' | 'updated_at'>) => ({
  status: plan.status || 'draft',
  description: plan.description || '',
  user_id: plan.userId,
  topic: plan.topic,
  duration: plan.duration,
  grade_level: plan.gradeLevel,
  prior_knowledge: plan.priorKnowledge,
  position: plan.position,
  content_goals: plan.contentGoals,
  skill_goals: plan.skillGoals,
  sections: plan.sections as unknown as Json,
  category: plan.category
});

export const lessonPlanService = {
  async getLessonPlans(): Promise<LessonPlan[]> {
    return dbOperation(async (client) => {
      const { data, error } = await client
        .from('lesson_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(toAppLessonPlan);
    });
  },

  async publishLessonPlan(id: string): Promise<LessonPlan> {
    return dbOperation(async (client) => {
      const { data, error } = await client
        .from('lesson_plans')
        .update({ status: 'published' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to publish lesson plan');
      return toAppLessonPlan(data);
    });
  },

  async getUserLessonPlans(userId: string): Promise<LessonPlan[]> {
    return dbOperation(async (client) => {
      const { data, error } = await client
        .from('lesson_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(toAppLessonPlan);
    });
  },

  async getLessonPlan(id: string): Promise<LessonPlan | null> {
    return dbOperation(async (client) => {
      const { data, error } = await client
        .from('lesson_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? toAppLessonPlan(data) : null;
    });
  },

  async createLessonPlan(lessonPlan: Omit<LessonPlan, 'id' | 'created_at' | 'updated_at'>): Promise<LessonPlan> {
    return dbOperation(async (client) => {
      const { data, error } = await client
        .from('lesson_plans')
        .insert([toDbLessonPlan(lessonPlan)])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create lesson plan');
      return toAppLessonPlan(data);
    });
  },

  async updateLessonPlan(id: string, updates: Partial<Omit<LessonPlan, 'id' | 'userId' | 'created_at' | 'updated_at'>>): Promise<LessonPlan> {
    return dbOperation(async (client) => {
      const { data, error } = await client
        .from('lesson_plans')
        .update(toDbLessonPlan(updates as LessonPlan))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update lesson plan');
      return toAppLessonPlan(data);
    });
  },

  async deleteLessonPlan(id: string): Promise<void> {
    return dbOperation(async (client) => {
      const { error } = await client
        .from('lesson_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    });
  }
};
