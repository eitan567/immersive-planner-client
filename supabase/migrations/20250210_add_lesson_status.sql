-- Add status and description columns to lesson_plans table
ALTER TABLE lesson_plans
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  ADD COLUMN IF NOT EXISTS description text;

-- Update existing rows to have 'draft' status
UPDATE lesson_plans SET status = 'draft' WHERE status IS NULL;

-- Update database_types.ts
COMMENT ON COLUMN lesson_plans.status IS 'Status of the lesson plan (draft or published)';
COMMENT ON COLUMN lesson_plans.description IS 'Optional description of the lesson plan';
