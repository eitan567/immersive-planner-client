import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.tsx';
import type { LessonPlan, LessonPlanSections, LessonSection } from '../types.ts';
import { lessonPlanService } from '../services/lessonPlanService.ts';
import { mapCategoryToHebrew } from '../components/chat/useChatLogic.ts';
import { translateContent } from "../../../utils/translations.ts";

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
  basicInfo: {
    title: '',
    duration: '',
    gradeLevel: '',
    priorKnowledge: '',
    contentGoals: '',
    skillGoals: ''
  },
  sections: {
    opening: [],
    main: [],
    summary: []
  },
  status: 'draft',
  description: '',
  category: ''
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

const ensureBasicInfo = (plan: Partial<LessonPlan>): LessonPlan => {
  if (!plan) {
    throw new Error('Cannot ensure basic info for null plan');
  }

  // First create the core fields
  const corePlan = {
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
    updated_at: plan.updated_at || new Date().toISOString()
  };

  // Then ensure basicInfo reflects the same values
  const basicInfo = {
    title: corePlan.topic, // Always use topic as title
    duration: corePlan.duration,
    gradeLevel: corePlan.gradeLevel,
    priorKnowledge: corePlan.priorKnowledge,
    contentGoals: corePlan.contentGoals,
    skillGoals: corePlan.skillGoals
  };

  return {
    ...corePlan,
    basicInfo
  } as LessonPlan; // Type assertion since we know this matches LessonPlan
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
        
        // First check for an AI-generated plan
        const generatedPlan = localStorage.getItem(PLAN_STORAGE_KEY);
        if (generatedPlan) {
          try {
            const parsedPlan = JSON.parse(generatedPlan);
            if (parsedPlan && typeof parsedPlan === 'object') {
              // Ensure the plan has all required fields and proper basicInfo sync
              plan = ensureBasicInfo({
                ...parsedPlan,
                userId: user.id,
                // Preserve user-provided values
                topic: parsedPlan.topic,
                category: parsedPlan.category
              });
              localStorage.removeItem(PLAN_STORAGE_KEY);
            } else {
              throw new Error('Invalid plan format');
            }
          } catch (err) {
            console.error('Failed to parse AI-generated plan:', err);
            localStorage.removeItem(PLAN_STORAGE_KEY);
            throw err;
          }
        }
        // Then try to load by URL ID
        else if (lessonId) {
          try {
            const loadedPlan = await lessonPlanService.getLessonPlan(lessonId);
            if (loadedPlan) {
              plan = ensureBasicInfo(loadedPlan);
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
                plan = ensureBasicInfo(loadedPlan);
              } else {
                throw new Error('Saved lesson not found');
              }
            } catch (err) {
              console.error('Failed to load from localStorage:', err);
              localStorage.removeItem(STORAGE_KEY);
              plan = ensureBasicInfo(createEmptyLessonPlan(user.id));
            }
          } else {
            plan = ensureBasicInfo(createEmptyLessonPlan(user.id));
          }
        }

        // Final validation to ensure all fields are present
        const validatedPlan = ensureBasicInfo({
          ...plan,
          // Ensure empty strings rather than undefined
          duration: plan.duration || '',
          gradeLevel: plan.gradeLevel || '',
          priorKnowledge: plan.priorKnowledge || '',
          contentGoals: plan.contentGoals || '',
          skillGoals: plan.skillGoals || '',
          position: plan.position || ''
        });

        setLessonPlan(validatedPlan);
        setError(null);
        // Set unsaved changes if this is an AI-generated plan that hasn't been saved yet
        setUnsavedChanges(!validatedPlan.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize lesson plan');
        setLessonPlan(ensureBasicInfo(createEmptyLessonPlan(user.id)));
      } finally {
        setLoading(false);
      }
    };

    loadLessonPlan();
  }, [user, lessonId]);

  const handleBasicInfoChange = (
    field: keyof LessonPlan | Array<[string, string]>,
    value?: string
  ) => {
    if (!lessonPlan || !user) return;

    setLessonPlan(prevPlan => {
      if (!prevPlan) return null;

      if (Array.isArray(field)) {
        return field.reduce((plan, [key, val]) => {
          if (isSectionField(key)) {
            return { ...plan, sections: handleSectionUpdate(key, val, plan.sections) };
          }
          return { ...plan, [key]: val };
        }, prevPlan);
      }

      if (value === undefined) return prevPlan;

      const newPlan = { ...prevPlan, [field]: field === 'category' ? mapCategoryToHebrew(value) : value };
      
      // Keep basicInfo in sync with main fields
      if (['topic', 'duration', 'gradeLevel', 'priorKnowledge', 'contentGoals', 'skillGoals'].includes(field)) {
        newPlan.basicInfo = {
          ...newPlan.basicInfo,
          title: newPlan.topic,
          [field]: value
        };
      }

      return newPlan;
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
        
        // Save ID to localStorage after first successful save
        localStorage.setItem(STORAGE_KEY, savedPlan.id);
        
        // Navigate to the edit page after first save if navigate function is provided
        if (navigate) {
          navigate(`/lesson/${savedPlan.id}`);
        }
      } else {
        // For existing lessons, update the record
        const { id, created_at, updated_at, ...planWithoutMeta } = lessonPlan;
        savedPlan = await lessonPlanService.updateLessonPlan(lessonPlan.id, planWithoutMeta);
      }
      
      setLessonPlan(savedPlan);
      setLastSaved(new Date());
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
    spaceUsage: string,
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
      spaceUsage,
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
