/// <reference lib="dom" />
import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.tsx';
import type { LessonPlan, LessonPlanSections, LessonSection, LessonPhaseType } from '../types.ts';
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
  }
});

const createEmptySection = (): LessonSection => ({
  content: '',
  spaceUsage: '',
  screens: {
    screen1: '',
    screen2: '',
    screen3: ''
  }
});

const isPhaseKey = (key: string): key is LessonPhaseType => {
  return ['opening', 'main', 'summary'].includes(key);
};

const isSectionField = (key: string): boolean => {
  const [phase] = key.split('.');
  return isPhaseKey(phase);
};

const updateSection = (sections: LessonPlanSections, fieldPath: string, newValue: string): LessonPlanSections => {
  const [phase, index, prop] = fieldPath.split('.');
  if (!isPhaseKey(phase)) return sections;

  const sectionIndex = parseInt(index);
  if (isNaN(sectionIndex)) return sections;

  const updatedPhase = [...sections[phase]];
  if (!updatedPhase[sectionIndex]) {
    updatedPhase[sectionIndex] = createEmptySection();
  }

  const section = { ...updatedPhase[sectionIndex] };
  if (prop === 'content' || prop === 'spaceUsage') {
    section[prop] = newValue;
  } else if (prop.startsWith('screen')) {
    section.screens = { ...section.screens, [prop]: newValue };
  }

  updatedPhase[sectionIndex] = section;
  return { ...sections, [phase]: updatedPhase };
};

const useLessonPlanState = () => {
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
        const userPlans = await lessonPlanService.getUserLessonPlans(user.id);
        const existingPlanId = localStorage.getItem(STORAGE_KEY);
        
        if (existingPlanId) {
          const existingPlan = userPlans.find(plan => plan.id === existingPlanId);
          if (existingPlan) {
            setLessonPlan(existingPlan);
            setError(null);
            return;
          }
        }
        
        if (userPlans.length > 0) {
          const mostRecentPlan = userPlans[0];
          localStorage.setItem(STORAGE_KEY, mostRecentPlan.id);
          setLessonPlan(mostRecentPlan);
          setError(null);
          return;
        }
        
        const emptyPlan = createEmptyLessonPlan(user.id);
        const created = await lessonPlanService.createLessonPlan(emptyPlan);
        if (created.id) {
          localStorage.setItem(STORAGE_KEY, created.id);
        }
        setLessonPlan(created);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize lesson plan');
      } finally {
        setLoading(false);
      }
    };

    loadLessonPlan();
  }, [user]);

  const handleStepChange = (updater: number | ((prev: number) => number)) => {
    const newStep = typeof updater === 'function' ? updater(currentStep) : updater;
    setCurrentStep(newStep);
    localStorage.setItem(STEP_STORAGE_KEY, newStep.toString());
  };

  const handleBasicInfoChange = async (
    field: keyof LessonPlan | Array<[string, string]>,
    value?: string
  ) => {
    if (!lessonPlan || !user) return;

    setLessonPlan(prevPlan => {
      if (!prevPlan) return null;

      if (Array.isArray(field)) {
        return field.reduce((plan, [key, val]) => {
          if (isSectionField(key)) {
            return { ...plan, sections: updateSection(plan.sections, key, val) };
          }
          return { ...plan, [key]: val };
        }, prevPlan);
      }

      return { ...prevPlan, [field]: value };
    });

    setUnsavedChanges(true);
  };

  const saveCurrentPlan = async () => {
    if (!lessonPlan?.id || !user || saveInProgress) return;
    
    try {
      setSaveInProgress(true);
      const {...updates } = lessonPlan;
      await lessonPlanService.updateLessonPlan(lessonPlan.id, updates);
      setError(null);
      setLastSaved(new Date());
      setUnsavedChanges(false);
      localStorage.setItem(STORAGE_KEY, lessonPlan.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירת התוכנית');
    } finally {
      setSaveInProgress(false);
    }
  };

  const updateSections = (newSections: LessonPlanSections) => {
    if (!lessonPlan || !user) return;

    const updatedPlan = {
      ...lessonPlan,
      sections: newSections
    };

    setLessonPlan(updatedPlan);
    setUnsavedChanges(true);
  };

  const addSection = async (phase: keyof LessonPlanSections) => {
    if (!lessonPlan || !user) return;

    const newSection = createEmptySection();
    const updatedSections = {
      ...lessonPlan.sections,
      [phase]: [...lessonPlan.sections[phase], newSection]
    };

    updateSections(updatedSections);
  };

  const handleExport = () => {
    try {
      const text = generateLessonPlanText();
      const fileName = `תכנית_שיעור_${lessonPlan?.topic || 'חדש'}.txt`;
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

    let text = `תכנית שיעור: ${lessonPlan.topic}\n\n`;
    text += `זמן כולל: ${lessonPlan.duration}\n`;
    text += `שכבת גיל: ${lessonPlan.gradeLevel}\n`;
    text += `ידע קודם: ${lessonPlan.priorKnowledge}\n`;
    text += `מיקום בתוכן: ${lessonPlan.position}\n\n`;
    text += `מטרות ברמת התוכן:\n${lessonPlan.contentGoals}\n\n`;
    text += `מטרות ברמת המיומנויות:\n${lessonPlan.skillGoals}\n\n`;

    text += '== פתיחה ==\n';
    lessonPlan.sections.opening.forEach((section, i) => {
      text += `\nפעילות ${i + 1}:\n`;
      text += `תוכן: ${section.content}\n`;
      text += `מסך 1: ${section.screens.screen1}\n`;
      text += `מסך 2: ${section.screens.screen2}\n`;
      text += `מסך 3: ${section.screens.screen3}\n`;
      text += `ארגון הלומדים: ${section.spaceUsage}\n`;
    });

    text += '\n== גוף השיעור ==\n';
    lessonPlan.sections.main.forEach((section, i) => {
      text += `\nפעילות ${i + 1}:\n`;
      text += `תוכן: ${section.content}\n`;
      text += `מסך 1: ${section.screens.screen1}\n`;
      text += `מסך 2: ${section.screens.screen2}\n`;
      text += `מסך 3: ${section.screens.screen3}\n`;
      text += `ארגון הלומדים: ${section.spaceUsage}\n`;
    });

    text += '\n== סיכום ==\n';
    lessonPlan.sections.summary.forEach((section, i) => {
      text += `\nפעילות ${i + 1}:\n`;
      text += `תוכן: ${section.content}\n`;
      text += `מסך 1: ${section.screens.screen1}\n`;
      text += `מסך 2: ${section.screens.screen2}\n`;
      text += `מסך 3: ${section.screens.screen3}\n`;
      text += `ארגון הלומדים: ${section.spaceUsage}\n`;
    });

    return text;
  };

  const removeSection = async (phase: keyof LessonPlanSections, index: number) => {
    if (!lessonPlan || !user) return;

    const updatedSections = {
      ...lessonPlan.sections,
      [phase]: lessonPlan.sections[phase].filter((_, i) => i !== index)
    };

    updateSections(updatedSections);
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
    unsavedChanges
  };
};

export default useLessonPlanState;