import React from 'react';
import { Card } from '../../../components/ui/card.tsx';
import { Badge } from '../../../components/ui/badge.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { Pencil, Trash2, Globe, Clock } from 'lucide-react';
import { LessonPlan } from '../types.ts';

interface LessonCardProps {
  lesson: LessonPlan;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}

export function LessonCard({ lesson, onEdit, onDelete, onPublish }: LessonCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'תאריך לא ידוע';
      }
      return date.toLocaleString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'תאריך לא ידוע';
    }
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px] bg-gradient-to-br from-white to-[#f8f9ff] border border-[#e6e8f0]">
      {/* Status Badge - Absolute positioned */}
      <div className="absolute top-4 left-4">
        <Badge 
          className={`
            ${lesson.status === 'published' 
              ? 'bg-[#681bc2] hover:bg-[#681bc2]/90' 
              : 'bg-gray-500 hover:bg-gray-500/90'}
            transition-colors px-2.5 py-1 text-[11px] font-medium
          `}
        >
          {lesson.status === 'published' ? 'פורסם' : 'טיוטה'}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-3 mr-16">{lesson.basicInfo.title}</h3>
        
        {/* Metadata */}
        <div className="space-y-1.5 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>נוצר: {formatDate(lesson.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>עודכן: {formatDate(lesson.updated_at)}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-white border border-[#e2e3e8] text-[#681bc2] hover:border-[#681bc2] transition-colors">
            {lesson.category}
          </Badge>
          {lesson.basicInfo.duration && (
            <Badge className="bg-white border border-[#e2e3e8] text-gray-600 hover:border-gray-400 transition-colors">
              {lesson.basicInfo.duration} דקות
            </Badge>
          )}
          {lesson.basicInfo.gradeLevel && (
            <Badge className="bg-white border border-[#e2e3e8] text-gray-600 hover:border-gray-400 transition-colors">
              {lesson.basicInfo.gradeLevel}
            </Badge>
          )}
        </div>

        {/* Description */}
        {lesson.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {lesson.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-1 flex-row-reverse pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#681bc2] hover:bg-[#681bc2]/10 hover:text-[#681bc2]"
            onClick={() => onEdit(lesson.id)}
            title="ערוך שיעור"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:bg-red-50 hover:text-red-500"
            onClick={() => onDelete(lesson.id)}
            title="מחק שיעור"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {lesson.status !== 'published' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[#681bc2] hover:bg-[#681bc2]/10 hover:text-[#681bc2]"
              onClick={() => onPublish(lesson.id)}
              title="פרסם שיעור"
            >
              <Globe className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
