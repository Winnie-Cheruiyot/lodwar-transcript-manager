
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  admission_number TEXT NOT NULL,
  course TEXT NOT NULL,
  school_year TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_units JSONB NOT NULL DEFAULT '[]'::jsonb,
  remarks TEXT DEFAULT '',
  manager_comments TEXT DEFAULT '',
  hod_comments TEXT DEFAULT '',
  hod_name TEXT DEFAULT '',
  closing_day TEXT DEFAULT '',
  opening_day TEXT DEFAULT '',
  fee_balance TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transcripts_student_id ON public.transcripts(student_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO anon, authenticated;
GRANT ALL ON public.students TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transcripts TO anon, authenticated;
GRANT ALL ON public.transcripts TO service_role;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

-- Open access (no auth yet) -- TODO: restrict once login is added
CREATE POLICY "Public can manage students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage transcripts" ON public.transcripts FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transcripts_updated_at BEFORE UPDATE ON public.transcripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
