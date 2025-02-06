-- Create lesson_plans table
CREATE TABLE lesson_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic VARCHAR NOT NULL,
  duration VARCHAR NOT NULL,
  grade_level VARCHAR NOT NULL,
  prior_knowledge TEXT,
  position VARCHAR NOT NULL,
  content_goals TEXT,
  skill_goals TEXT,
  sections JSONB NOT NULL DEFAULT '{"opening": [], "main": [], "summary": []}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own lesson plans" ON lesson_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lesson plans" ON lesson_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson plans" ON lesson_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lesson plans" ON lesson_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lesson_plans_updated_at
    BEFORE UPDATE ON lesson_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster user-specific queries
CREATE INDEX lesson_plans_user_id_idx ON lesson_plans(user_id);
CREATE INDEX lesson_plans_created_at_idx ON lesson_plans(created_at DESC);