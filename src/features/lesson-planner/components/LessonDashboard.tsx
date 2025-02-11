import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.tsx';
import { LoadingSpinner } from '../../../components/ui/loading-spinner.tsx';
import { useNavigate } from "react-router-dom";
import { LessonPlan, LessonCategory, LESSON_CATEGORIES } from '../types.ts';
import { lessonPlanService } from '../services/lessonPlanService.ts';
import { Layout } from '../../common/components/Layout.tsx';
import { LessonCard } from './LessonCard.tsx';
import { LessonFilters } from './LessonFilters.tsx';
import { CreateLessonAIModal } from './CreateLessonAIModal.tsx';
import { useAILesson } from '../hooks/useAILesson.ts';

export function LessonDashboard() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLessons = async () => {
      if (!user) return;
      try {
        const data = await lessonPlanService.getUserLessonPlans(user.id);
        setLessons(data);
      } catch (err) {
        setError('טעינת השיעורים נכשלה');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLessons();
  }, [user]);

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.basicInfo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || lesson.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateEmpty = async () => {
    try {
      const lessonPlan = await lessonPlanService.createLessonPlan({
        userId: user!.id,
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
        basicInfo: {
          title: '',
          duration: '',
          gradeLevel: '',
          priorKnowledge: '',
          contentGoals: '',
          skillGoals: ''
        },
        category: LESSON_CATEGORIES[0] // Default category that must be actively changed by user
      });
      navigate(`/lesson/${lessonPlan.id}`);
    } catch (err) {
      setError('יצירת השיעור נכשלה');
      console.error(err);
    }
  };

  const { generateLesson, isGenerating } = useAILesson({
    onSuccess: async (generatedPlan) => {
      try {
        const updatedPlan = await lessonPlanService.updateLessonPlan(
          generatedPlan.id,
          {
            ...generatedPlan,
            status: 'draft',
          }
        );
        navigate(`/lesson/${updatedPlan.id}`);
      } catch (err) {
        setError('Failed to update lesson with AI content');
        console.error(err);
      }
    },
    onError: (errorMessage) => {
      setError(errorMessage);
      setIsAIModalOpen(false);
    }
  });

  const handleCreateAI = async (data: { topic: string, materials: string, category: LessonCategory }) => {
    try {
      const lessonPlan = await lessonPlanService.createLessonPlan({
        userId: user!.id,
        topic: data.topic,
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
        basicInfo: {
          title: data.topic,
          duration: '',
          gradeLevel: '',
          priorKnowledge: '',
          contentGoals: '',
          skillGoals: ''
        },
        category: data.category
      });

      await generateLesson({
        topic: data.topic,
        category: data.category,
        materials: data.materials || undefined
      });

      setIsAIModalOpen(false);
    } catch (err) {
      setError('יצירת השיעור נכשלה');
      console.error(err);
    }
  };

  const handleEdit = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleDelete = async (lessonId: string) => {
    await lessonPlanService.deleteLessonPlan(lessonId);
    setLessons(lessons.filter(lesson => lesson.id !== lessonId));
  };

  const handlePublish = async (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (!lesson.basicInfo.title?.trim() || !lesson.topic?.trim()) {
      setError('לא ניתן לפרסם שיעור ללא נושא. אנא מלא את שדה נושא היחידה.');
      return;
    }

    if (!lesson.category || lesson.category === LESSON_CATEGORIES[0]) {
      setError('לא ניתן לפרסם שיעור ללא בחירת קטגוריה. אנא בחר קטגוריה.');
      return;
    }

    try {
      await lessonPlanService.publishLessonPlan(lessonId);
      // Refresh lessons list
      const updatedLessons = await lessonPlanService.getUserLessonPlans(user!.id);
      setLessons(updatedLessons);
      setError(null);
    } catch (err) {
      setError('פרסום השיעור נכשל');
      console.error(err);
    }
  };

  if (!user) return null;

  const dashboardContent = (
    <div className="container mx-auto p-6" dir="rtl">
      <LessonFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {isLoading || isGenerating ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPublish={handlePublish}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Layout 
        user={user}
        mode="dashboard"
        rightSidebarProps={{
          onCreateEmpty: handleCreateEmpty,
          onCreateAI: () => setIsAIModalOpen(true)
        }}
      >
        {dashboardContent}
      </Layout>
      
      <CreateLessonAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onCreate={handleCreateAI}
      />
    </>
  );
}
