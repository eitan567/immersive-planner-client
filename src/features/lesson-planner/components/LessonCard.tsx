import React from 'react';
import { Button } from '../../../components/ui/button.tsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../../components/ui/card.tsx';
import type { LessonPlan } from '../types.ts';
import { PenBox, Trash2, Upload } from 'lucide-react';

interface LessonCardProps {
  lesson: LessonPlan;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}

export function LessonCard({
  lesson,
  onEdit,
  onDelete,
  onPublish,
}: LessonCardProps) {
  const { id, basicInfo, status, category } = lesson;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTitle = (title: string) => {
    return title.length > 50 ? title.substring(0, 50) + '...' : title;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'פורסם';
      case 'draft':
        return 'טיוטה';
      default:
        return status;
    }
  };

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col min-h-[200px] bg-[#f7f7f7]">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-[#f06094] line-clamp-2">
              {formatTitle(basicInfo.title)}
            </CardTitle>
          </div>
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
              status
            )}`}
          >
            {getStatusText(status)}
          </span>
        </div>
        <CardDescription className="text-sm text-[#000000] font-medium">
          קטגוריה: {category}
        </CardDescription>
        <div className="text-xs text-gray-500 mt-1">
          <time>נוצר: {new Date(lesson.created_at).toLocaleString('he-IL', {
            dateStyle: 'short',
            timeStyle: 'short'
          })}</time>
          <span className="mx-2">•</span>
          <time>עודכן: {new Date(lesson.updated_at).toLocaleString('he-IL', {
            dateStyle: 'short',
            timeStyle: 'short'
          })}</time>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        {basicInfo.duration && (
          <div className="text-sm text-gray-600">
            משך זמן: {basicInfo.duration}
          </div>
        )}
        {basicInfo.gradeLevel && (
          <div className="text-sm text-gray-600">
            שכבת גיל: {basicInfo.gradeLevel}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4 border-t mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(id)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <PenBox className="w-4 h-4" />
        </Button>
        {status !== 'published' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPublish(id)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Upload className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
