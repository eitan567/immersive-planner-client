import React, { useState, useEffect, ChangeEvent } from 'react'
import { useAuth } from '../../auth/AuthContext.tsx'
import { Button } from '../../../components/ui/button.tsx'
import { Card } from '../../../components/ui/card.tsx'
import { Input } from '../../../components/ui/input.tsx'
import { Label } from '../../../components/ui/label.tsx'
import { Badge } from '../../../components/ui/badge.tsx'
import { LoadingSpinner } from '../../../components/ui/loading-spinner.tsx'
import { useNavigate } from "react-router-dom"
import { LessonPlan } from '../types.ts'
import { lessonPlanService } from '../services/lessonPlanService.ts'

export function LessonDashboard() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<LessonPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [aiTopic, setAiTopic] = useState('')
  const [aiMaterials, setAiMaterials] = useState('')
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

  const filteredLessons = lessons.filter(lesson =>
    lesson.basicInfo.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        }
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

  const handleCreateAI = async () => {
    try {
      // TODO: Implement AI lesson creation
      setIsAIModalOpen(false)
    } catch (error) {
      console.error('Failed to create AI lesson:', error)
    }
  }

  const getStatusText = (status: string) => {
    return status === 'published' ? 'פורסם' : 'טיוטה'
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">השיעורים שלי</h1>
        <div className="space-x-4 flex flex-row-reverse">
          <Button onClick={() => setIsAIModalOpen(true)}>
            צור שיעור בעזרת AI
          </Button>
          <Button onClick={handleCreateEmpty} variant="outline">
            צור שיעור ריק
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder="חיפוש שיעורים..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <Card key={lesson.id} className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{lesson.basicInfo.title}</h3>
              <Badge className={lesson.status === 'published' ? 'bg-green-500' : 'bg-gray-500'}>
                {getStatusText(lesson.status)}
              </Badge>
            </div>
            <p className="text-gray-600 mb-4">{lesson.description || 'אין תיאור'}</p>
            <div className="flex justify-start space-x-2 flex-row-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(lesson.id)}
              >
                ערוך
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(lesson.id)}
              >
                מחק
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handlePublish(lesson.id)}
              >
                פרסם
              </Button>
            </div>
          </Card>
        ))}
        </div>
      )}

      {isAIModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-[500px] p-6">
            <h2 className="text-xl font-bold mb-4">יצירת שיעור בעזרת AI</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">נושא</Label>
                <Input
                  id="topic"
                  value={aiTopic}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAiTopic(e.target.value)}
                  placeholder="הזן את נושא השיעור"
                />
              </div>
              <div>
                <Label htmlFor="materials">חומרי למידה</Label>
                <Input
                  id="materials"
                  value={aiMaterials}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAiMaterials(e.target.value)}
                  placeholder="הזן או העלה חומרי למידה"
                />
              </div>
              <div className="flex justify-start space-x-2 flex-row-reverse">
                <Button onClick={handleCreateAI}>צור שיעור</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAIModalOpen(false)}
                >
                  ביטול
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
