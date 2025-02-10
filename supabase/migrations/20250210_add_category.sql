-- Add category column to lesson_plans table
ALTER TABLE lesson_plans
ADD COLUMN category text NOT NULL DEFAULT 'מדעים';

-- Add check constraint to ensure only valid categories
ALTER TABLE lesson_plans
ADD CONSTRAINT valid_category CHECK (
  category IN ('מדעים', 'מתמטיקה', 'אנגלית', 'שפה', 'מדעי החברה', 'היסטוריה')
);
