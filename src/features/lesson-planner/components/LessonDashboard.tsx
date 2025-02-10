import React, { useState, useEffect } from 'react'
import { useAuth } from '../../auth/AuthContext.tsx'
import { Input } from '../../../components/ui/input.tsx'
import { LoadingSpinner } from '../../../components/ui/loading-spinner.tsx'
import { useNavigate } from "react-router-dom"
import { LessonPlan, LessonCategory } from '../types.ts'
import { lessonPlanService } from '../services/lessonPlanService.ts'
import { Layout } from '../../common/components/Layout.tsx'
import { LessonCard } from './LessonCard.tsx'
import { LessonFilters } from './LessonFilters.tsx'
import { CreateLessonAIModal } from './CreateLessonAIModal.tsx'

export function LessonDashboard() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<LessonPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const loadLessons = async () => {
      if (!user) return
      try {
        const data = await lessonPlanService.getUserLessonPlans(user.id)
        setLessons(data)
      } catch (err) {
        setError('טעינת השיעורים נכשלה')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadLessons()
  }, [user])

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.basicInfo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || lesson.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  })

  const handleCreateAI = async (data: { topic: string, materials: string, category: LessonCategory }) => {
    try {
      // TODO: Add API call to create AI lesson
      const newPlan = await lessonPlanService.createLessonPlan({
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
      })
      
      // TODO: Add API call to generate lesson content using AI
      // For now, just navigate to the new lesson
      setIsAIModalOpen(false)
      navigate(`/lesson/${newPlan.id}`)
    } catch (err) {
      setError('יצירת השיעור נכשלה')
      console.error(err)
    }
  }

  const handleCreateEmpty = async () => {
    try {
      const newPlan = await lessonPlanService.createLessonPlan({
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
          title: 'שיעור חדש',
          duration: '',
          gradeLevel: '',
          priorKnowledge: '',
          contentGoals: '',
          skillGoals: ''
        },
        category: 'מתמטיקה' // Default category
      })
      navigate(`/lesson/${newPlan.id}`)
    } catch (err) {
      setError('יצירת השיעור נכשלה')
      console.error(err)
    }
  }

  const handleEdit = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`)
  }

  const handleDelete = async (lessonId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק שיעור זה?')) {
      await lessonPlanService.deleteLessonPlan(lessonId)
      setLessons(lessons.filter(lesson => lesson.id !== lessonId))
    }
  }

  const handlePublish = async (lessonId: string) => {
    await lessonPlanService.publishLessonPlan(lessonId)
    // Refresh lessons list
    const updatedLessons = await lessonPlanService.getLessonPlans()
    setLessons(updatedLessons)
  }

  if (!user) return null

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

      {isLoading ? (
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
  )

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
  )
}
