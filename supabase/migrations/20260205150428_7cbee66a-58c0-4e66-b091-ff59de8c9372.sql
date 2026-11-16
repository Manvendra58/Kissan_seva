-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'farmer');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'farmer',
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table for farmer information
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

-- Create crops table for agricultural information
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

-- Create government schemes table
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

-- Create market prices table
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

-- Create weather updates table
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

-- Create farmer queries table
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

-- Create notifications table
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

-- Create seasonal calendar table
CREATE TABLE public.seasonal_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    crop_name TEXT NOT NULL,
    activity TEXT NOT NULL,
    tips TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seasonal_calendar ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can delete own profile or admins can delete"
ON public.profiles FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- RLS Policies for crops (public read, admin write)
CREATE POLICY "Anyone can view crops"
ON public.crops FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage crops"
ON public.crops FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS Policies for schemes (public read, admin write)
CREATE POLICY "Anyone can view schemes"
ON public.schemes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage schemes"
ON public.schemes FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS Policies for market_prices (public read, admin write)
CREATE POLICY "Anyone can view market prices"
ON public.market_prices FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage market prices"
ON public.market_prices FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS Policies for weather_updates (public read, admin write)
CREATE POLICY "Anyone can view weather updates"
ON public.weather_updates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage weather updates"
ON public.weather_updates FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS Policies for farmer_queries
CREATE POLICY "Users can view own queries or admins can view all"
ON public.farmer_queries FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create own queries"
ON public.farmer_queries FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own queries or admins can update"
ON public.farmer_queries FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can delete own queries or admins can delete"
ON public.farmer_queries FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- RLS Policies for notifications (public read, admin write)
CREATE POLICY "Anyone can view active notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (is_active = true OR public.is_admin());

CREATE POLICY "Only admins can manage notifications"
ON public.notifications FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS Policies for seasonal_calendar (public read, admin write)
CREATE POLICY "Anyone can view seasonal calendar"
ON public.seasonal_calendar FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage seasonal calendar"
ON public.seasonal_calendar FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply update trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crops_updated_at
    BEFORE UPDATE ON public.crops
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schemes_updated_at
    BEFORE UPDATE ON public.schemes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_prices_updated_at
    BEFORE UPDATE ON public.market_prices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farmer_queries_updated_at
    BEFORE UPDATE ON public.farmer_queries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();