import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../components/ui/select.tsx';
import { Input } from '../../../components/ui/input.tsx';
import { LESSON_CATEGORIES } from '../types.ts';

interface LessonFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

export function LessonFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange
}: LessonFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6" dir="rtl">
      <Input
        placeholder="חיפוש שיעורים..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-md"
      />
      <div className="flex gap-4">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="all">כל הסטטוסים</SelectItem>
          <SelectItem value="draft">טיוטה</SelectItem>
          <SelectItem value="published">פורסם</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="תחום" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="all">כל התחומים</SelectItem>
            {LESSON_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
