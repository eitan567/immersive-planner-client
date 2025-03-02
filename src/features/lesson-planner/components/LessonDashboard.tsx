import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.tsx';
import { LoadingSpinner } from '../../../components/ui/loading-spinner.tsx';
import { useNavigate } from "react-router-dom";
import { LessonPlan, LessonCategory, LESSON_CATEGORIES } from '../types';
import { lessonPlanService } from '../services/lessonPlanService';
import { Layout } from '../../common/components/Layout.tsx';
import { LessonCard } from './LessonCard.tsx';
import { LessonFilters } from './LessonFilters.tsx';
import { CreateLessonAIModal } from './CreateLessonAIModal.tsx';
import { useAILesson } from '../hooks/useAILesson';

export function LessonDashboard() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedView, setSelectedView] = useState('grid');
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
    const matchesSearch = lesson.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || lesson.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateEmpty = () => {
    localStorage.removeItem('currentLessonPlanId');
    localStorage.removeItem('currentLessonPlan'); // Ensure no AI plan exists
    navigate('/lesson/new');
  };

  const { generateLesson, isGenerating } = useAILesson({
    onSuccess: (generatedPlan) => {
      setIsAIModalOpen(false);
      navigate('/lesson/new', { replace: true });
    },
    onError: (errorMessage) => {
      setError(errorMessage);
      setIsAIModalOpen(false);
    }
  });

  const handleCreateAI = async (data: { 
    topic?: string, 
    materials?: { title: string; content: string } | string, 
    category?: LessonCategory 
  }) => {
    try {
      localStorage.removeItem('currentLessonPlanId');
      
      // שליחת הנתונים עם ערכים ריקים במקום undefined
      await generateLesson({
        topic: data.topic || '',
        category: data.category,
        materials: data.materials || ''
      });
    } catch (err) {
      setError('יצירת השיעור נכשלה');
      console.error(err);
    }
  };

  const handleEdit = (lessonId: string) => {
    localStorage.removeItem('currentLessonPlan'); // Ensure no AI plan exists
    navigate(`/lesson/${lessonId}`);
  };

  const handleDelete = async (lessonId: string) => {
    await lessonPlanService.deleteLessonPlan(lessonId);
    setLessons(lessons.filter(lesson => lesson.id !== lessonId));
  };

  const handlePublish = async (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (!lesson.topic?.trim()) {
      setError('לא ניתן לפרסם שיעור ללא נושא. אנא מלא את שדה נושא היחידה.');
      return;
    }

    if (!lesson.category || !lesson.category) {
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

  const renderLessons = () => {
    if (selectedView === 'presentation') {
      return (
        <div className="flex flex-col gap-6">
          {filteredLessons.map((lesson) => (
            <div key={lesson.id} className="w-full p-6 bg-white rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">{lesson.topic}</h2>
              <div className="mb-4">
                <p className="text-lg">{lesson.description}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">קטגוריה: {lesson.category}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(lesson.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    ערוך
                  </button>
                  {lesson.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(lesson.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      פרסם
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={`grid ${
        selectedView === 'list' ? 'grid-cols-1 gap-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
      }`}>
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
    );
  };

  const dashboardContent = (
    <div className="container mx-auto p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-[#f06094]">השיעורים שלי</h1>
      <LessonFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedView={selectedView}
        onViewChange={setSelectedView}
      />

      {isLoading || isGenerating ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        renderLessons()
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
        saveCurrentPlan={async () => {}}
        saveInProgress={false}
        lastSaved={null}
      >
        {dashboardContent}
      </Layout>
      
      <CreateLessonAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onCreate={handleCreateAI}
        isGenerating={isGenerating}
      />
    </>
  );
}
