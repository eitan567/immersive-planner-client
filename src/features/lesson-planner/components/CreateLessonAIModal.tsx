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
import { Label } from '../../../components/ui/label.tsx';
import { Textarea } from '../../../components/ui/textarea.tsx';

interface CreateLessonAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { 
    topic?: string; 
    materials?: { title: string; content: string } | string; 
    category?: LessonCategory 
  }) => void;
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
    
    // בדיקה שלפחות אחד מהשדות מוזן
    if (!topic.trim() && !materials.trim() && !category) {
      setError('נא להזין לפחות אחד מהשדות');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // שליחה של השדות עם ערכי ברירת מחדל ריקים במקום undefined
      const data: { 
        topic?: string; 
        materials?: { title: string; content: string } | string; 
        category?: LessonCategory 
      } = {};
      
      // רק אם יש ערך בשדה, נוסיף אותו לאובייקט
      if (topic.trim()) {
        data.topic = topic.trim();
      }
      if (materials.trim()) {
        // ננסה לזהות אם יש כותרת בתוך התוכן
        const lines = materials.trim().split('\n');
        if (lines.length > 1) {
          data.materials = {
            title: lines[0].trim(),
            content: lines.slice(1).join('\n').trim()
          };
        } else {
          data.materials = materials.trim();
        }
      }
      if (category) {
        data.category = category as LessonCategory;
      }

      onCreate(data);
    } catch (err) {
      setError('אירעה שגיאה ביצירת השיעור');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // Check if at least one field has a value
  const isFormValid = topic.trim() || materials.trim() || category;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent dir="rtl" className="max-w-2xl bg-white">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-2xl font-semibold text-[#fa4083]">
            יצירת שיעור בעזרת AI
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            הזן לפחות אחד מהפרטים הבאים ליצירת שיעור חדש
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
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">נושא היחידה</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="לדוגמה: מעגל החיים של הפרפר"
              />
            </div>

            <div>
              <Label htmlFor="materials">חומרי עזר</Label>
              <Textarea
                id="materials"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="לדוגמה: מצגת, סרטון, כרטיסיות..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="category">קטגוריה (לא חובה)</Label>
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
            disabled={isSubmitting || isGenerating || !isFormValid}
            className="bg-[#fa4083] hover:bg-[#7122db]"
          >
            צור שיעור
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
