-- Drop existing constraint
ALTER TABLE lesson_plans DROP CONSTRAINT IF EXISTS valid_category;

-- Update check constraint with all valid categories
ALTER TABLE lesson_plans
ADD CONSTRAINT valid_category CHECK (
  category IN (
    'מתמטיקה',
    'אנגלית',
    'עברית',
    'תנ״ך',
    'היסטוריה',
    'אזרחות',
    'ספרות',
    'פיזיקה',
    'כימיה',
    'ביולוגיה',
    'מדעים',
    'גיאוגרפיה',
    'מחשבים',
    'אומנות',
    'מוזיקה',
    'חינוך גופני',
    'פילוסופיה',
    'פסיכולוגיה',
    'סוציולוגיה',
    'חינוך חברתי'
  )
);
