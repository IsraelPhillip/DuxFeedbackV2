
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Feedback submissions
CREATE TABLE public.feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  account_number TEXT,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  services_used TEXT[] NOT NULL DEFAULT '{}',
  feedback_comment TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  ip_address_optional TEXT,
  device_info_optional TEXT,
  status TEXT NOT NULL DEFAULT 'submitted'
);

GRANT INSERT ON public.feedback_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.feedback_submissions TO authenticated;
GRANT ALL ON public.feedback_submissions TO service_role;

ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback" ON public.feedback_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view feedback" ON public.feedback_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update feedback" ON public.feedback_submissions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete feedback" ON public.feedback_submissions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-grant admin role to the first signup (for initial setup)
CREATE OR REPLACE FUNCTION public.handle_first_user_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_first_user_admin();
