export interface ScreenConfig {
  screen1: string;
  screen2: string;
  screen3: string;
}

export interface LessonSection {
  content: string;
  spaceUsage: string;
  screens: {
    screen1: string;
    screen2: string;
    screen3: string;
    screen1Description?: string;
    screen2Description?: string;
    screen3Description?: string;
  };
}

export interface LessonPlanSections {
  opening: LessonSection[];
  main: LessonSection[];
  summary: LessonSection[];
}

export interface LessonPlan {
  id: string;
  userId: string;
  topic: string;
  duration: string;
  gradeLevel: string;
  priorKnowledge: string;
  position: string;
  contentGoals: string;
  skillGoals: string;
  sections: LessonPlanSections;
  created_at: string;
  updated_at: string;
  basicInfo: {
    title: string;
    duration: string;
    gradeLevel: string;
    priorKnowledge: string;
    contentGoals: string;
    skillGoals: string;
  };

}

export type LessonPhaseType = 'opening' | 'main' | 'summary';