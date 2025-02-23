import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../../../components/ui/alert-dialog.tsx';
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
  isGenerating?: boolean; // Add this prop
}

export function CreateLessonAIModal({ isOpen, onClose, onCreate, isGenerating }: CreateLessonAIModalProps) {
  const [topic, setTopic] = useState('');
  const [materials, setMaterials] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      setError('נא להזין נושא');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      onCreate({
        topic: topic.trim(),
        materials,
        category: category as LessonCategory,
      });
    } catch (err) {
      setError('אירעה שגיאה ביצירת השיעור');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent dir="rtl" className="max-w-2xl bg-white">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-2xl font-semibold text-[#540ba9]">
            יצירת שיעור בעזרת AI
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            הזן את הפרטים הבאים ליצירת שיעור חדש
          </AlertDialogDescription>
        </AlertDialogHeader>

        {(isSubmitting || isGenerating) && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-50 rounded-lg">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-lg font-medium text-gray-700">
                יוצר שיעור חדש, אנא המתן...
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </form>

        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel 
            disabled={isSubmitting || isGenerating}
            className="bg-gray-100 hover:bg-gray-200"
          >
            ביטול
          </AlertDialogCancel>
          <AlertDialogAction
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || isGenerating}
            className="bg-[#540ba9] hover:bg-[#7122db]"
          >
            צור שיעור
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
