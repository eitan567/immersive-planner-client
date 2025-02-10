import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '../../../components/ui/alert-dialog.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { Input } from '../../../components/ui/input.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select.tsx';
import { LessonCategory, LESSON_CATEGORIES } from '../types.ts';
import { LoadingSpinner } from '../../../components/ui/loading-spinner.tsx';

interface CreateLessonAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { topic: string; materials: string; category: LessonCategory }) => void;
}

export function CreateLessonAIModal({
  isOpen,
  onClose,
  onCreate,
}: CreateLessonAIModalProps) {
  const [topic, setTopic] = useState('');
  const [materials, setMaterials] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!topic.trim()) {
      setError('נושא היחידה הוא שדה חובה');
      return;
    }

    if (!category) {
      setError('קטגוריה היא שדה חובה');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      onCreate({
        topic: topic.trim(),
        materials,
        category: category as LessonCategory,
      });

    } catch (err) {
      setError('אירעה שגיאה ביצירת השיעור');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTopic('');
    setMaterials('');
    setCategory('');
    setError(null);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent dir="rtl" className="max-w-2xl bg-white">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-2xl font-semibold text-[#540ba9]">
            יצירת שיעור בעזרת AI
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            הכנס את פרטי השיעור ותן ל-AI ליצור עבורך מערך שיעור
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <label className="text-base font-medium mb-2 block">נושא היחידה *</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="הכנס את נושא היחידה"
            />
          </div>

          <div>
            <label className="text-base font-medium mb-2 block">קטגוריה *</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                {LESSON_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-base font-medium mb-2 block">חומרי למידה</label>
            <textarea
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="הכנס חומרי למידה עבור ה-AI"
              className="w-full min-h-[150px] p-3 border rounded-md"
            />
            <p className="text-sm text-gray-500 mt-1">
              המודל ישתמש בחומרים אלו ליצירת תוכן השיעור
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
              {error}
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex justify-between gap-2 px-6 py-4 border-t">
          <div className="order-1">
            <Button variant="outline" onClick={handleClose}>
              ביטול
            </Button>
          </div>
          <div className="order-2">
            <Button
              onClick={handleCreate}
              className="bg-[#681bc2] text-white hover:bg-[#681bc2]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingSpinner /> : 'צור שיעור'}
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
