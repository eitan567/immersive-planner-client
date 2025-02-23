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

  React.useEffect(() => {
    if (isOpen) {
      setTopic('סרטי מדע בידיוני');
      setMaterials(`# סרטי מדע בידיוני: מסע בין דמיון למציאות

סרטי מדע בידיוני הם אחת מהז'אנרים המרתקים והמשפיעים ביותר בתעשיית הקולנוע. הם מהווים חלון הצצה לעתיד אפשרי, משקפים את החששות והתקוות של החברה האנושית, ומאפשרים לנו לחקור רעיונות מורכבים על טכנולוגיה, מדע ואנושות דרך עדשת הדמיון.

## התפתחות הז'אנר

מאז ימיו הראשונים של הקולנוע, סרטי מדע בידיוני תפסו מקום מרכזי בתרבות הפופולרית. "המסע אל הירח" (1902) של ז'ורז' מלייס נחשב לאחד מסרטי המדע הבידיוני הראשונים, והציב תבנית לאופן שבו הקולנוע יכול להציג חזיונות עתידניים. עם התפתחות הטכנולוגיה הקולנועית, התפתח גם הז'אנר עצמו, מסרטים פשוטים על חייזרים וטיסות חלל ועד ליצירות מורכבות העוסקות בשאלות פילוסופיות עמוקות.

## השפעה על המציאות

רבים מהרעיונות שהוצגו בסרטי מדע בידיוני הפכו למציאות. טלפונים ניידים, טאבלטים, ומסכי מגע הם דוגמאות לטכנולוגיות שהופיעו תחילה בסרטי מדע בידיוני לפני שהפכו למציאות יומיומית. סדרת "מסע בין כוכבים" למשל, הציגה מכשירים רבים שהשפיעו על פיתוח טכנולוגיות אמיתיות, כמו הטריקורדר שהשפיע על פיתוח סורקים רפואיים ניידים.

## נושאים מרכזיים

סרטי מדע בידיוני עוסקים במגוון רחב של נושאים:

### בינה מלאכותית ורובוטיקה
סרטים כמו "בלייד ראנר", "אני רובוט", ו"אקס מכינה" בוחנים את היחסים המורכבים בין בני אדם למכונות חושבות, ומעלים שאלות על תודעה, רגשות ומוסר.

### מסעות בזמן
סרטים כמו "בחזרה לעתיד", "התחלה" ו"טנט" מציגים תפיסות שונות של מסע בזמן ומשחקים עם רעיונות של סיבתיות ופרדוקסים.

### עולמות פוסט-אפוקליפטיים
סרטים כמו "מד מקס", "ילדי האדם" ו"משחקי הרעב" מציגים תרחישים של עתיד דיסטופי ובוחנים כיצד החברה האנושית מתמודדת עם אסונות גלובליים.

## אפקטים מיוחדים וטכנולוגיה

התפתחות הטכנולוגיה הקולנועית שינתה את האופן שבו ניתן להציג חזיונות עתידניים על המסך. מאפקטים מכניים פשוטים ועד לגרפיקה ממוחשבת מתקדמת, סרטי מדע בידיוני תמיד היו בחזית החדשנות הטכנולוגית בקולנוע. סרטים כמו "אווטאר", "כוח המשיכה" ו"אינטרסטלר" דחפו את גבולות האפשרי באפקטים מיוחדים והציגו חוויות קולנועיות חדשניות.

## מסרים חברתיים

סרטי מדע בידיוני משמשים לעתים קרובות ככלי לביקורת חברתית. דרך סיפורים על עולמות אחרים או עתידיים, יוצרי הסרטים יכולים לבחון נושאים רגישים כמו גזענות, מעמדות חברתיים, שינויי אקלים ופוליטיקה. "מטריקס" למשל, מעלה שאלות על מציאות ותודעה, בעוד "אליסיום" עוסק באי-שוויון חברתי.

## השפעה תרבותית

סרטי מדע בידיוני השפיעו עמוקות על התרבות הפופולרית. הם יצרו מונחים, רעיונות וסמלים שהפכו לחלק מהשפה היומיומית. סדרות כמו "מלחמת הכוכבים" ו"מסע בין כוכבים" יצרו קהילות מעריצים גלובליות והשפיעו על דורות של יוצרים.

## העתיד של הז'אנר

עם התפתחות הטכנולוגיה והשינויים החברתיים המהירים, סרטי מדע בידיוני ממשיכים להתפתח ולהתחדש. נושאים כמו מציאות מדומה, שיבוט, הנדסה גנטית ושינויי אקלים מקבלים תשומת לב גוברת. במקביל, הגבולות בין מדע בידיוני למציאות הופכים מטושטשים יותר, כאשר טכנולוגיות שנחשבו פעם לדמיוניות הופכות למציאות.

## סיכום

סרטי מדע בידיוני הם הרבה יותר מבידור גרידא. הם משמשים כמראה לחברה, כמעבדה לרעיונות חדשניים, וכאמצעי לחקור את העתיד האפשרי של האנושות. דרך שילוב של דמיון, טכנולוגיה ואמנות, הם ממשיכים לאתגר את תפיסת המציאות שלנו ולהרחיב את גבולות האפשרי.`);
      setCategory('אומנות');
      setError(null);
    }
  }, [isOpen]);

  const handleCreate = () => {
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
