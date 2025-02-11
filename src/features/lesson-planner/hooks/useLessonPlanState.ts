import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.tsx';
import type { LessonPlan, LessonPlanSections, LessonSection } from '../types.ts';
import { lessonPlanService } from '../services/lessonPlanService.ts';

const STORAGE_KEY = 'currentLessonPlanId';
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
  category: 'מתמטיקה' // default category
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
        let plan: LessonPlan | null = null;

        if (lessonId) {
          plan = await lessonPlanService.getLessonPlan(lessonId);
        }

        if (!plan) {
          const emptyPlan = createEmptyLessonPlan(user.id);
          plan = await lessonPlanService.createLessonPlan(emptyPlan);
          if (plan.id) {
            localStorage.setItem(STORAGE_KEY, plan.id);
          }
        }

        setLessonPlan(plan);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize lesson plan');
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

      return { ...prevPlan, [field]: value };
    });
    setUnsavedChanges(true);
  };

  const saveCurrentPlan = async () => {
    if (!lessonPlan?.id || !user || saveInProgress) return;
    
    try {
      setSaveInProgress(true);
      
      const updatesToSend = JSON.parse(JSON.stringify({
        ...lessonPlan,
        sections: lessonPlan.sections
      }));

      await lessonPlanService.updateLessonPlan(lessonPlan.id, updatesToSend);
      setLastSaved(new Date());
      setUnsavedChanges(false);
      localStorage.setItem(STORAGE_KEY, lessonPlan.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving plan');
    } finally {
      setSaveInProgress(false);
    }
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
    text += `Topic: ${lessonPlan.topic}\n`;
    text += `Duration: ${lessonPlan.duration}\n`;
    text += `Grade Level: ${lessonPlan.gradeLevel}\n`;
    text += `Prior Knowledge: ${lessonPlan.priorKnowledge}\n`;
    text += `Position: ${lessonPlan.position}\n\n`;
    text += `Content Goals:\n${lessonPlan.contentGoals}\n\n`;
    text += `Skill Goals:\n${lessonPlan.skillGoals}\n\n`;

    ['opening', 'main', 'summary'].forEach((phase) => {
      text += `\n== ${phase.toUpperCase()} ==\n`;
      lessonPlan.sections[phase as PhaseType].forEach((section, i) => {
        text += `\nActivity ${i + 1}:\n`;
        text += `Content: ${section.content}\n`;
        if (section.screen1) {
          text += `Screen 1: ${section.screen1}\n`;
          if (section.screen1Description) {
            text += `Screen 1 Description: ${section.screen1Description}\n`;
          }
        }
        if (section.screen2) {
          text += `Screen 2: ${section.screen2}\n`;
          if (section.screen2Description) {
            text += `Screen 2 Description: ${section.screen2Description}\n`;
          }
        }
        if (section.screen3) {
          text += `Screen 3: ${section.screen3}\n`;
          if (section.screen3Description) {
            text += `Screen 3 Description: ${section.screen3Description}\n`;
          }
        }
        if (section.spaceUsage) {
          text += `Space Usage: ${section.spaceUsage}\n`;
        }
      });
    });

    return text;
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
