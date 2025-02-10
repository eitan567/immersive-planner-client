import React, { useState } from 'react';
import { Card } from '../../../components/ui/card.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { Input } from '../../../components/ui/input.tsx';
import { Label } from '../../../components/ui/label.tsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select.tsx';
import { LESSON_CATEGORIES, LessonCategory } from '../types.ts';

interface CreateLessonAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { topic: string, materials: string, category: LessonCategory }) => void;
}

export function CreateLessonAIModal({ isOpen, onClose, onCreate }: CreateLessonAIModalProps) {
  const [topic, setTopic] = useState('');
  const [materials, setMaterials] = useState('');
  const [category, setCategory] = useState<LessonCategory>(LESSON_CATEGORIES[0]);
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ topic, materials, category });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value as LessonCategory);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" dir="rtl">
      <Card className="w-full max-w-md p-6 bg-white">
        <h2 className="text-2xl font-semibold mb-6 text-center">יצירת שיעור חדש</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>נושא השיעור</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="הכנס את נושא השיעור"
              required
            />
          </div>

          <div>
            <Label>תחום</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="בחר תחום" />
              </SelectTrigger>
              <SelectContent>
                {LESSON_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>חומרי למידה</Label>
            <textarea
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="הכנס כאן חומרי למידה, מאמרים או קישורים רלוונטיים"
              className="w-full min-h-[100px] p-2 border rounded-md"
            />
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="text-[#681bc2] border border-[#681bc2] hover:!bg-[#681bc2] hover:!text-white"
            >
              ביטול
            </Button>
            <Button
              type="submit"
              className="bg-[#681bc2] text-white hover:opacity-90"
            >
              צור שיעור
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
