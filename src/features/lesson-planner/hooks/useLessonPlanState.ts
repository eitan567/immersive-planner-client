import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.tsx';
import type { LessonPlan, LessonPlanSections, LessonSection } from '../types';
import { materialsService } from '../services/materialsService';
import { lessonPlanService } from '../services/lessonPlanService';
import { mapCategoryToHebrew } from '../components/chat/useChatLogic';
import { translateContent } from "../../../utils/translations";

const STORAGE_KEY = 'currentLessonPlanId';
const PLAN_STORAGE_KEY = 'currentLessonPlan';
const STEP_STORAGE_KEY = 'currentLessonPlanStep';

const createEmptyLessonPlan = (userId: string): Omit<LessonPlan, 'id' | 'created_at' | 'updated_at'> => ({
  userId,
  topic: '',
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
  category: '',
  material_id: null
});

const createEmptySection = (): LessonSection => ({
  id: crypto.randomUUID(),
  content: '',
  spaceUsage: '',
  screen1: '',
  screen2: '',
  screen3: '',
  screen1Description: '',
  screen2Description: '',
  screen3Description: ''
});

type PhaseType = keyof LessonPlanSections;

const isPhaseKey = (key: string): key is PhaseType => {
  return ['opening', 'main', 'summary'].includes(key);
};

const isSectionField = (key: string): boolean => {
  const [phase] = key.split('.');
  return isPhaseKey(phase);
};

const handleSectionUpdate = (fieldPath: string, newValue: string, currentSections: LessonPlanSections): LessonPlanSections => {
  const parts = fieldPath.split('.');
  if (parts.length < 3) {
    console.warn('handleSectionUpdate expects at least 3 parts (phase, index, field). Received:', parts);
    return currentSections;
  }

  const phase = parts[0];
  const rawIndex = parts[1];
  const field = parts.slice(2).join('.');

  if (!isPhaseKey(phase)) {
    console.warn('handleSectionUpdate: invalid phase', phase);
    return currentSections;
  }

  const targetIndex = parseInt(rawIndex, 10);
  if (isNaN(targetIndex)) {
    console.warn('handleSectionUpdate: index is not a number', rawIndex);
    return currentSections;
  }

  const sectionsCopy = { ...currentSections };
  const phaseSections = [...(sectionsCopy[phase] || [])];

  while (phaseSections.length <= targetIndex) {
    phaseSections.push(createEmptySection());
  }

  const section = { ...phaseSections[targetIndex] };

  if (field === 'content' || field === 'spaceUsage') {
    section[field] = newValue;
  } else if (
    field === 'screen1' || 
    field === 'screen2' || 
    field === 'screen3' ||
    field === 'screen1Description' ||
    field === 'screen2Description' ||
    field === 'screen3Description'
  ) {
    section[field] = newValue;
  } else {
    console.warn('handleSectionUpdate: unknown field path =>', fieldPath);
    return currentSections;
  }

  phaseSections[targetIndex] = section;
  sectionsCopy[phase] = phaseSections;

  return sectionsCopy;
};

const ensureLessonPlan = (plan: Partial<LessonPlan>): LessonPlan => {
  if (!plan) {
    throw new Error('Cannot ensure lesson plan for null plan');
  }

  const validatedPlan = {
    id: plan.id || '',
    userId: plan.userId || '',
    topic: plan.topic || '',
    duration: plan.duration || '',
    gradeLevel: plan.gradeLevel || '',
    priorKnowledge: plan.priorKnowledge || '',
    position: plan.position || '',
    contentGoals: plan.contentGoals || '',
    skillGoals: plan.skillGoals || '',
    sections: plan.sections || { opening: [], main: [], summary: [] },
    status: plan.status || 'draft',
    description: plan.description || '',
    category: plan.category || '',
    created_at: plan.created_at || new Date().toISOString(),
    updated_at: plan.updated_at || new Date().toISOString(),
    material_id: (plan as any).material_id || null
  };

  return validatedPlan as LessonPlan;
};

const useLessonPlanState = (lessonId?: string) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem(STEP_STORAGE_KEY);
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    localStorage.setItem(STEP_STORAGE_KEY, currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    const loadLessonPlan = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let plan: LessonPlan;
        
        // Check for an AI-generated plan
        const generatedPlan = localStorage.getItem(PLAN_STORAGE_KEY);
        console.log('[State] Loading generated plan from storage:', generatedPlan);
        
        // If we have a lessonId from URL, store it in localStorage
        if (lessonId) {
          localStorage.setItem(STORAGE_KEY, lessonId);
          console.log('[State] Stored lessonId in localStorage:', lessonId);
        }
        
        if (generatedPlan) {
          try {
            const parsedPlan = JSON.parse(generatedPlan);
            console.log('[State] Parsed plan from storage:', parsedPlan);
            
            if (!parsedPlan || typeof parsedPlan !== 'object') {
              throw new Error('Invalid plan format');
            }

            // Validate sections structure
            const sections = parsedPlan.sections || { opening: [], main: [], summary: [] };
            console.log('[State] Sections structure:', sections);

            const validatedPlan = {
              ...parsedPlan,
              userId: user.id,
              sections: {
                opening: Array.isArray(sections.opening) ? sections.opening : [],
                main: Array.isArray(sections.main) ? sections.main : [],
                summary: Array.isArray(sections.summary) ? sections.summary : []
              }
            };
            
            console.log('[State] Validated plan before ensure:', validatedPlan);
            plan = ensureLessonPlan(validatedPlan);
            console.log('[State] Final plan after ensure:', plan);
            
            // נמחק את התוכן מ-localStorage רק אחרי שהתוכנית נשמרה לדאטהבייס
            if (validatedPlan.id) {
              localStorage.removeItem(PLAN_STORAGE_KEY);
              console.log('[State] Cleared AI plan from storage after successful save');
            }
          } catch (err) {
            console.error('[State] Failed to parse AI-generated plan:', err);
            // השארת התוכנית ב-localStorage כדי לנסות לטעון אותה שוב
            throw new Error('תקלה בטעינת תכנית השיעור - מנסה שוב...');
          }
        }
        // Then try to load by URL ID
        else if (lessonId) {
          try {
            const loadedPlan = await lessonPlanService.getLessonPlan(lessonId);
            if (loadedPlan) {
              plan = ensureLessonPlan(loadedPlan);
            } else {
              throw new Error('Lesson not found');
            }
          } catch (err) {
            console.error('Failed to load lesson by ID:', err);
            throw err;
          }
        }
        // Try to load from localStorage ID
        else {
          const savedId = localStorage.getItem(STORAGE_KEY);
          if (savedId) {
            try {
              const loadedPlan = await lessonPlanService.getLessonPlan(savedId);
              if (loadedPlan) {
                plan = ensureLessonPlan(loadedPlan);
              } else {
                throw new Error('Saved lesson not found');
              }
            } catch (err) {
              console.error('Failed to load from localStorage:', err);
              localStorage.removeItem(STORAGE_KEY);
              plan = ensureLessonPlan(createEmptyLessonPlan(user.id));
            }
          } else {
            plan = ensureLessonPlan(createEmptyLessonPlan(user.id));
          }
        }

        // Final validation to ensure all fields are present
      // Use type assertion to handle the potential extra material_id field
      const validatedPlan = ensureLessonPlan({
        ...plan,
        // Ensure empty strings rather than undefined
        duration: plan.duration || '',
        gradeLevel: plan.gradeLevel || '',
        priorKnowledge: plan.priorKnowledge || '',
        contentGoals: plan.contentGoals || '',
        skillGoals: plan.skillGoals || '',
        position: plan.position || '',
        material_id: (plan as any).material_id
      });

        // If there's a material_id, load the material content
        if (validatedPlan.material_id) {
          try {
            const material = await materialsService.getMaterial(validatedPlan.material_id);
            if (material) {
              validatedPlan.materials = {
                title: material.title,
                content: material.content
              };
            }
          } catch (err) {
            console.error('Failed to load material content:', err);
            // Don't throw error here, just continue without materials
          }
      }

        setLessonPlan(validatedPlan);
        setError(null);
        // Set unsaved changes if this is an AI-generated plan that hasn't been saved yet
        setUnsavedChanges(!validatedPlan.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize lesson plan');
        setLessonPlan(ensureLessonPlan(createEmptyLessonPlan(user.id)));
      } finally {
        setLoading(false);
      }
    };

    loadLessonPlan();
  }, [user, lessonId]);

  const handleBasicInfoChange = (
    field: Array<[string, string]> | 'topic' | 'duration' | 'gradeLevel' | 'priorKnowledge' | 'position' | 'contentGoals' | 'skillGoals' | 'category' | 'description',
    value?: string
  ) => {
    if (!lessonPlan || !user) return;

    setLessonPlan(prevPlan => {
      if (!prevPlan) return null;

      // Handle array of changes
      if (Array.isArray(field)) {
        const newPlan = field.reduce((plan, [key, val]) => {
          if (isSectionField(key)) {
            return { ...plan, sections: handleSectionUpdate(key, val, plan.sections) };
          }
          const updatedPlan = { ...plan, [key]: val };
          return updatedPlan;
        }, prevPlan);
        return newPlan;
      }

      // Handle single field change
      if (value === undefined) return prevPlan;

      // Create new plan with updated field
      const updatedPlan = {
        ...prevPlan,
        [field]: field === 'category' ? mapCategoryToHebrew(value) : value
      };

      return updatedPlan;
    });
    
    setUnsavedChanges(true);
  };

  const updateSections = (newSections: LessonPlanSections) => {
    if (!lessonPlan || !user) return;

    setLessonPlan(prevPlan => {
      if (!prevPlan) return null;
      return {
        ...prevPlan,
        sections: newSections
      };
    });
    setUnsavedChanges(true);
  };

  const addSection = async (phase: PhaseType) => {
    if (!lessonPlan || !user) return;

    const newSection = createEmptySection();
    const updatedSections = {
      ...lessonPlan.sections,
      [phase]: [...lessonPlan.sections[phase], newSection]
    };

    updateSections(updatedSections);
  };

  const removeSection = async (phase: PhaseType, index: number) => {
    if (!lessonPlan || !user) return;

    const updatedSections = {
      ...lessonPlan.sections,
      [phase]: lessonPlan.sections[phase].filter((_, i) => i !== index)
    };

    updateSections(updatedSections);
  };

  const handleStepChange = (updater: number | ((prev: number) => number)) => {
    const newStep = typeof updater === 'function' ? updater(currentStep) : updater;
    setCurrentStep(newStep);
    localStorage.setItem(STEP_STORAGE_KEY, newStep.toString());
  };

  const handleExport = () => {
    try {
      const text = generateLessonPlanText();
      const fileName = `lesson_plan_${lessonPlan?.topic || 'new'}.txt`;
      const file = new File([text], fileName, { type: 'text/plain' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export lesson plan');
    }
  };

  const generateLessonPlanText = () => {
    if (!lessonPlan) return '';

    let text = '';
    text += `קטגוריה: ${lessonPlan.category}\n`;
    text += `נושא היחידה: ${lessonPlan.topic}\n`;
    text += `זמן כולל: ${lessonPlan.duration}\n`;
    text += `שכבת גיל: ${lessonPlan.gradeLevel}\n`;
    text += `ידע קודם נדרש: ${lessonPlan.priorKnowledge}\n`;
    text += `מיקום בתוכן: ${lessonPlan.position}\n\n`;
    text += `מטרות ברמת התוכן:\n${lessonPlan.contentGoals}\n\n`;
    text += `מטרות ברמת המיומנויות:\n${lessonPlan.skillGoals}\n\n`;

    ['פתיחה', 'גוף השיעור', 'סיכום'].forEach((phase) => {
      text += `\n== ${phase} ==\n`;
      const phaseMap: Record<string, PhaseType> = {
        'פתיחה': 'opening',
        'גוף השיעור': 'main',
        'סיכום': 'summary'
      };
      const mappedPhase = phaseMap[phase];
      if (mappedPhase) {
        lessonPlan.sections[mappedPhase].forEach((section, i) => {
          text += `\nפעילות ${i + 1}:\n`;
          text += `תוכן/פעילות: ${section.content}\n`;
          if (section.screen1) {
            text += `מסך 1: ${section.screen1}\n`;
            if (section.screen1Description) {
              text += `תיאור מסך 1: ${section.screen1Description}\n`;
            }
          }
          if (section.screen2) {
            text += `מסך 2: ${section.screen2}\n`;
            if (section.screen2Description) {
              text += `תיאור מסך 2: ${section.screen2Description}\n`;
            }
          }
          if (section.screen3) {
            text += `מסך 3: ${section.screen3}\n`;
            if (section.screen3Description) {
              text += `תיאור מסך 3: ${section.screen3Description}\n`;
            }
          }
          if (section.spaceUsage) {
            text += `שימוש במרחב הפיזי: ${section.spaceUsage}\n`;
          }
        });
      }
    });

    return translateContent(text);
  };

  const saveCurrentPlan = async (navigate?: (path: string) => void) => {
    if (!lessonPlan || !user || saveInProgress) return;
    
    // Skip saving if category is not selected or topic is empty
    if (!lessonPlan.category || !lessonPlan.topic.trim()) {
      return;
    }

    try {
      setSaveInProgress(true);
      
      let savedPlan: LessonPlan;
      
      // For new lessons without an ID, create new DB record
      if (!lessonPlan.id) {
        const { id, created_at, updated_at, ...planWithoutId } = lessonPlan;
        savedPlan = await lessonPlanService.createLessonPlan(planWithoutId);
        
        // Save both ID and full plan to localStorage after first save
        localStorage.setItem(STORAGE_KEY, savedPlan.id);
        
localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(savedPlan));

        // Navigate to the edit page after first save if navigate function is provided
        if (navigate) {
          navigate(`/lesson/${savedPlan.id}`);
        }
      } else {
        // For existing lessons, update the record
        // עבור שיעורים קיימים, נעדכן את הרשומה כולל material_id
        const { id, created_at, updated_at, ...planWithoutMeta } = lessonPlan;
        savedPlan = await lessonPlanService.updateLessonPlan(lessonPlan.id, {
          ...planWithoutMeta,
          material_id: lessonPlan.material_id
        });
        
        // Update both ID and full plan in localStorage
        localStorage.setItem(STORAGE_KEY, savedPlan.id);
        localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(savedPlan));
      }
      
      setLessonPlan(savedPlan);
      setLastSaved(new Date());
      console.log('[State] Successfully saved plan with ID:', savedPlan.id);
      setUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving plan');
    } finally {
      setSaveInProgress(false);
    }
  };

  const createAndAddSection = async (
    phase: PhaseType,
    content: string,
    spaceUsage?: string,
    screen1?: string,
    screen2?: string,
    screen3?: string,
    screen1Description?: string,
    screen2Description?: string,
    screen3Description?: string
  ) => {
    if (!lessonPlan || !user) return;

    const newSection = {
      ...createEmptySection(),
      content,
      spaceUsage: spaceUsage ?? '',
      screen1,
      screen2,
      screen3,
      screen1Description,
      screen2Description,
      screen3Description
    };

    setLessonPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: {
          ...prev.sections,
          [phase]: [...prev.sections[phase], newSection]
        }
      };
    });
    setUnsavedChanges(true);
  };

  return {
    currentStep,
    lessonPlan,
    loading,
    error,
    saveInProgress,
    lastSaved,
    handleBasicInfoChange,
    addSection,
    removeSection,
    setCurrentStep: handleStepChange,
    handleExport,
    generateLessonPlanText,
    updateSections,
    saveCurrentPlan,
    unsavedChanges,
    createAndAddSection
  };
};

export default useLessonPlanState;
