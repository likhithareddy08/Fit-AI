-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create workouts table (predefined workouts)
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  duration TEXT NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0-6 for Sunday-Saturday
  exercises JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view workouts"
  ON public.workouts FOR SELECT
  USING (true);

-- Create workout sessions table (track user workouts)
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create meals table
CREATE TABLE public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  carbs INTEGER NOT NULL,
  fats INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meals"
  ON public.meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON public.meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON public.meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON public.meals FOR DELETE
  USING (auth.uid() = user_id);

-- Insert sample workouts for each day
INSERT INTO public.workouts (name, difficulty, duration, day_of_week, exercises) VALUES
('Monday: Chest & Triceps', 'Intermediate', '45 min', 1, '[
  {"name": "Bench Press", "sets": 4, "reps": "8-10", "rest": "90s"},
  {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "rest": "60s"},
  {"name": "Cable Flyes", "sets": 3, "reps": "12-15", "rest": "60s"},
  {"name": "Tricep Dips", "sets": 3, "reps": "8-10", "rest": "60s"},
  {"name": "Overhead Tricep Extension", "sets": 3, "reps": "10-12", "rest": "60s"}
]'::jsonb),
('Tuesday: Back & Biceps', 'Intermediate', '50 min', 2, '[
  {"name": "Deadlifts", "sets": 4, "reps": "6-8", "rest": "2min"},
  {"name": "Pull-ups", "sets": 3, "reps": "6-8", "rest": "90s"},
  {"name": "Barbell Rows", "sets": 4, "reps": "8-10", "rest": "90s"},
  {"name": "Bicep Curls", "sets": 3, "reps": "10-12", "rest": "60s"},
  {"name": "Hammer Curls", "sets": 3, "reps": "10-12", "rest": "60s"}
]'::jsonb),
('Wednesday: Legs', 'Advanced', '55 min', 3, '[
  {"name": "Squats", "sets": 5, "reps": "5-8", "rest": "3min"},
  {"name": "Romanian Deadlifts", "sets": 4, "reps": "8-10", "rest": "2min"},
  {"name": "Leg Press", "sets": 3, "reps": "12-15", "rest": "90s"},
  {"name": "Leg Curls", "sets": 3, "reps": "12-15", "rest": "60s"},
  {"name": "Calf Raises", "sets": 4, "reps": "15-20", "rest": "60s"}
]'::jsonb),
('Thursday: Shoulders & Abs', 'Intermediate', '45 min', 4, '[
  {"name": "Overhead Press", "sets": 4, "reps": "8-10", "rest": "90s"},
  {"name": "Lateral Raises", "sets": 3, "reps": "12-15", "rest": "60s"},
  {"name": "Front Raises", "sets": 3, "reps": "12-15", "rest": "60s"},
  {"name": "Planks", "sets": 3, "reps": "60s hold", "rest": "60s"},
  {"name": "Russian Twists", "sets": 3, "reps": "20", "rest": "60s"}
]'::jsonb),
('Friday: Full Body Power', 'Advanced', '50 min', 5, '[
  {"name": "Power Cleans", "sets": 4, "reps": "5", "rest": "2min"},
  {"name": "Front Squats", "sets": 4, "reps": "6-8", "rest": "2min"},
  {"name": "Push Press", "sets": 3, "reps": "8-10", "rest": "90s"},
  {"name": "Bent Over Rows", "sets": 3, "reps": "8-10", "rest": "90s"},
  {"name": "Box Jumps", "sets": 3, "reps": "10", "rest": "90s"}
]'::jsonb),
('Saturday: Upper Body Hypertrophy', 'Intermediate', '45 min', 6, '[
  {"name": "Dumbbell Bench Press", "sets": 4, "reps": "10-12", "rest": "60s"},
  {"name": "Cable Rows", "sets": 4, "reps": "10-12", "rest": "60s"},
  {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10-12", "rest": "60s"},
  {"name": "Face Pulls", "sets": 3, "reps": "15-20", "rest": "60s"},
  {"name": "Arm Circuit", "sets": 3, "reps": "12-15", "rest": "60s"}
]'::jsonb),
('Sunday: Active Recovery', 'Beginner', '30 min', 0, '[
  {"name": "Light Cardio", "sets": 1, "reps": "20 min", "rest": "0s"},
  {"name": "Stretching", "sets": 1, "reps": "10 min", "rest": "0s"},
  {"name": "Foam Rolling", "sets": 1, "reps": "10 min", "rest": "0s"}
]'::jsonb);

-- Trigger for updating profiles updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();