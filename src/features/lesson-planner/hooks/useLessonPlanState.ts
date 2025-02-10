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
  },
  status: 'draft',
  description: ''
});

const createEmptySection = (): LessonSection => ({
  content: '',
  spaceUsage: '',
  screens: {
    screen1: '',
    screen2: '',
    screen3: '',
    screen1Description: '',
    screen2Description: '',
    screen3Description: ''
  }
});

const isPhaseKey = (key: string): key is LessonPhaseType => {
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

  // Validate the phase
  if (!isPhaseKey(phase)) {
    console.warn('handleSectionUpdate: invalid phase', phase);
    return currentSections;
  }

  // Convert index from string to number
  const targetIndex = parseInt(rawIndex, 10);
  if (isNaN(targetIndex)) {
    console.warn('handleSectionUpdate: index is not a number', rawIndex);
    return currentSections;
  }

  const sectionsCopy = { ...currentSections };
  const phaseSections = [...(sectionsCopy[phase] || [])];

  // Create empty sections if needed
  while (phaseSections.length <= targetIndex) {
    phaseSections.push(createEmptySection());
  }

  const section = { ...phaseSections[targetIndex] };
  
  // Top-level fields
  if (field === 'content' || field === 'spaceUsage') {
    (section as any)[field] = newValue;
  } else if (field.startsWith('screens.')) {
    // e.g. screens.screen1, screens.screen1Description
    const [, screenField] = field.split('.');
    section.screens = { ...section.screens, [screenField]: newValue };
    console.log(`Updated screen field ${screenField} to:`, newValue); // Debug log
  } else if (field.startsWith('screen')) {
    // Handle both screen type and description updates
    // e.g. screen1, screen1Description
    section.screens = { ...section.screens, [field]: newValue };
    console.log(`Updated direct screen field ${field} to:`, newValue); // Debug log
  } else {
    console.warn('handleSectionUpdate: unknown field path =>', fieldPath);
  }

  phaseSections[targetIndex] = section;
  sectionsCopy[phase] = phaseSections;

  // Debug log entire section after update
  console.log(`Updated section for ${phase}.${targetIndex}:`, section);
  
  return sectionsCopy;
}

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

        if (lessonId) {
          const plan = await lessonPlanService.getLessonPlan(lessonId);
          if (plan) {
            setLessonPlan(plan);
            setError(null);
            return;
          }
        }
        
        // No lesson ID or lesson not found - create new plan
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
        console.log('Processing batch updates:', field);
        
        return field.reduce((plan, [key, val]) => {
          if (isSectionField(key)) {
            return { ...plan, sections: handleSectionUpdate(key, val, plan.sections) };
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
      
      // Create a deep copy to ensure all nested objects are included
      const updatesToSend = JSON.parse(JSON.stringify({
        ...lessonPlan,
        sections: {
          opening: lessonPlan.sections.opening.map(section => ({
            ...section,
            screens: { ...section.screens }
          })),
          main: lessonPlan.sections.main.map(section => ({
            ...section,
            screens: { ...section.screens }
          })),
          summary: lessonPlan.sections.summary.map(section => ({
            ...section,
            screens: { ...section.screens }
          }))
        }
      }));

      console.log('Saving plan with updates:', updatesToSend); // Debug log
      
      await lessonPlanService.updateLessonPlan(lessonPlan.id, updatesToSend);
      setError(null);
      setLastSaved(new Date());
      setUnsavedChanges(false);
      localStorage.setItem(STORAGE_KEY, lessonPlan.id);
    } catch (err) {
      console.error('Error saving plan:', err); // Debug log
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

  const createAndAddSection = async (
    phase: keyof LessonPlanSections,
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
  
    console.log('Creating new section:', { 
      phase, content, spaceUsage, 
      screen1, screen2, screen3,
      screen1Description, screen2Description, screen3Description 
    });
  
    const newSection = {
      content,
      spaceUsage,
      screens: {
        screen1,
        screen2,
        screen3,
        screen1Description,
        screen2Description,
        screen3Description
      }
    };
  
    setLessonPlan(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        sections: {
          ...prev.sections,
          [phase]: [...(prev.sections[phase] || []), newSection]
        }
      };
    });
  
    setUnsavedChanges(true);
    await saveCurrentPlan();
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
      if (section.screens.screen1Description) {
        text += `תיאור מסך 1: ${section.screens.screen1Description}\n`;
      }
      text += `מסך 2: ${section.screens.screen2}\n`;
      if (section.screens.screen2Description) {
        text += `תיאור מסך 2: ${section.screens.screen2Description}\n`;
      }
      text += `מסך 3: ${section.screens.screen3}\n`;
      if (section.screens.screen3Description) {
        text += `תיאור מסך 3: ${section.screens.screen3Description}\n`;
      }
      text += `ארגון הלומדים: ${section.spaceUsage}\n`;
    });

    text += '\n== גוף השיעור ==\n';
    lessonPlan.sections.main.forEach((section, i) => {
      text += `\nפעילות ${i + 1}:\n`;
      text += `תוכן: ${section.content}\n`;
      text += `מסך 1: ${section.screens.screen1}\n`;
      if (section.screens.screen1Description) {
        text += `תיאור מסך 1: ${section.screens.screen1Description}\n`;
      }
      text += `מסך 2: ${section.screens.screen2}\n`;
      if (section.screens.screen2Description) {
        text += `תיאור מסך 2: ${section.screens.screen2Description}\n`;
      }
      text += `מסך 3: ${section.screens.screen3}\n`;
      if (section.screens.screen3Description) {
        text += `תיאור מסך 3: ${section.screens.screen3Description}\n`;
      }
      text += `ארגון הלומדים: ${section.spaceUsage}\n`;
    });

    text += '\n== סיכום ==\n';
    lessonPlan.sections.summary.forEach((section, i) => {
      text += `\nפעילות ${i + 1}:\n`;
      text += `תוכן: ${section.content}\n`;
      text += `מסך 1: ${section.screens.screen1}\n`;
      if (section.screens.screen1Description) {
        text += `תיאור מסך 1: ${section.screens.screen1Description}\n`;
      }
      text += `מסך 2: ${section.screens.screen2}\n`;
      if (section.screens.screen2Description) {
        text += `תיאור מסך 2: ${section.screens.screen2Description}\n`;
      }
      text += `מסך 3: ${section.screens.screen3}\n`;
      if (section.screens.screen3Description) {
        text += `תיאור מסך 3: ${section.screens.screen3Description}\n`;
      }
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
    unsavedChanges,
    createAndAddSection
  };
};

export default useLessonPlanState;
