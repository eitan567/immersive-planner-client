export interface ScreenConfig {
  screen1: string;
  screen2: string;
  screen3: string;
}

export interface LessonSection {
  content: string;
  screens: ScreenConfig;
  spaceUsage: string;
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

export type LessonPhaseType = keyof LessonPlanSections;