-- Farmwise Connect - Complete Database Setup
-- Run this in Supabase SQL Editor (Project > SQL Editor > New Query)
-- Use when your database has no tables yet

-- 1. Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'farmer');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'farmer',
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    mobile TEXT,
    email TEXT,
    state TEXT,
    district TEXT,
    crop_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create crops table
CREATE TABLE public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    soil_preparation TEXT,
    fertilizers TEXT,
    pesticides TEXT,
    organic_methods TEXT,
    modern_techniques TEXT,
    season TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

-- 5. Create schemes table
CREATE TABLE public.schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    eligibility TEXT,
    benefits TEXT,
    application_process TEXT,
    deadline DATE,
    pdf_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

-- 6. Create market_prices table
CREATE TABLE public.market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name TEXT NOT NULL,
    market_name TEXT,
    state TEXT,
    district TEXT,
    price_per_quintal DECIMAL(10, 2),
    price_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

-- 7. Create weather_updates table
CREATE TABLE public.weather_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT,
    district TEXT,
    temperature DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    rainfall_probability DECIMAL(5, 2),
    weather_condition TEXT,
    alert_type TEXT,
    alert_message TEXT,
    forecast_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.weather_updates ENABLE ROW LEVEL SECURITY;

-- 8. Create farmer_queries table
CREATE TABLE public.farmer_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    admin_response TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farmer_queries ENABLE ROW LEVEL SECURITY;

-- 9. Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'general',
    target_states TEXT[],
    target_crops TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 10. Create seasonal_calendar table
CREATE TABLE public.seasonal_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    crop_name TEXT NOT NULL,
    activity TEXT NOT NULL,
    tips TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seasonal_calendar ENABLE ROW LEVEL SECURITY;

-- 11. Helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- 12. Trigger for new user signup (creates profile + farmer role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_role app_role := 'farmer';
BEGIN
  INSERT INTO public.profiles (user_id, full_name, mobile, email, state, district, crop_type)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.raw_user_meta_data->>'mobile',
    NEW.email, NEW.raw_user_meta_data->>'state', NEW.raw_user_meta_data->>'district', NEW.raw_user_meta_data->>'crop_type');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, user_role);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON public.crops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON public.schemes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_market_prices_updated_at BEFORE UPDATE ON public.market_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_farmer_queries_updated_at BEFORE UPDATE ON public.farmer_queries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. RLS Policies - user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 15. RLS Policies - profiles
CREATE POLICY "Users can view own profile or admins can view all" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can delete own profile or admins can delete" ON public.profiles FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- 16. RLS Policies - crops
CREATE POLICY "Anyone can view crops" ON public.crops FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can manage crops" ON public.crops FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 17. RLS Policies - schemes
CREATE POLICY "Anyone can view schemes" ON public.schemes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can manage schemes" ON public.schemes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 18. RLS Policies - market_prices
CREATE POLICY "Anyone can view market prices" ON public.market_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can manage market prices" ON public.market_prices FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 19. RLS Policies - weather_updates
CREATE POLICY "Anyone can view weather updates" ON public.weather_updates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can manage weather updates" ON public.weather_updates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 20. RLS Policies - farmer_queries
CREATE POLICY "Users can view own queries or admins can view all" ON public.farmer_queries FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can create own queries" ON public.farmer_queries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update any query" ON public.farmer_queries FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Farmers can update own query content" ON public.farmer_queries FOR UPDATE TO authenticated USING (user_id = auth.uid() AND NOT public.is_admin()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own queries or admins can delete" ON public.farmer_queries FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.protect_farmer_query_admin_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NEW.admin_response IS DISTINCT FROM OLD.admin_response
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.responded_at IS DISTINCT FROM OLD.responded_at THEN
      RAISE EXCEPTION 'Only admins can update query status or admin response';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS protect_farmer_query_admin_fields ON public.farmer_queries;
CREATE TRIGGER protect_farmer_query_admin_fields
  BEFORE UPDATE ON public.farmer_queries
  FOR EACH ROW EXECUTE FUNCTION public.protect_farmer_query_admin_fields();

-- 21. RLS Policies - notifications
CREATE POLICY "Anyone can view active notifications" ON public.notifications FOR SELECT TO authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY "Only admins can manage notifications" ON public.notifications FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 22. RLS Policies - seasonal_calendar
CREATE POLICY "Anyone can view seasonal calendar" ON public.seasonal_calendar FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can manage seasonal calendar" ON public.seasonal_calendar FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
