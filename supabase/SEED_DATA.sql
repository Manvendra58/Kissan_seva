-- Kisan Seva starter content
-- Run in Supabase SQL Editor AFTER SETUP_DATABASE.sql (or on an existing project).
-- Safe to re-run: uses NOT EXISTS guards.

-- Government schemes
INSERT INTO public.schemes (name, description, eligibility, benefits, application_process, deadline, is_active)
SELECT * FROM (VALUES
  (
    'PM-KISAN',
    'Direct income support of ₹6,000 per year to farmer families, payable in three equal installments.',
    'All landholding farmer families with cultivable land (subject to scheme exclusions).',
    '₹6,000 per year in 3 installments of ₹2,000 each, credited to bank account.',
    '1. Visit pmkisan.gov.in' || E'\n' || '2. Complete New Farmer Registration' || E'\n' || '3. Submit Aadhaar and land details',
    DATE '2026-12-31',
    true
  ),
  (
    'Pradhan Mantri Fasal Bima Yojana',
    'Crop insurance providing financial support when notified crops fail due to natural calamities.',
    'Farmers growing notified crops in notified areas (loanee and non-loanee).',
    'Low premium (about 2% Kharif / 1.5% Rabi). Sum insured based on scale of finance.',
    '1. Apply via bank, CSC, or PMFBY portal' || E'\n' || '2. Submit land records and Aadhaar' || E'\n' || '3. Pay premium',
    DATE '2026-07-31',
    true
  ),
  (
    'Kisan Credit Card',
    'Timely short-term credit for cultivation and allied activities.',
    'Owner cultivators, tenant farmers, oral lessees, and sharecroppers.',
    'Credit facility with interest subvention where eligible; flexible repayment.',
    '1. Apply at a bank branch' || E'\n' || '2. Submit ID and land/tenancy proof' || E'\n' || '3. Bank sanctions KCC limit',
    NULL,
    true
  ),
  (
    'Soil Health Card Scheme',
    'Soil testing with crop-wise nutrient and fertilizer recommendations.',
    'Farmers with agricultural land. Service is free of cost.',
    'Free soil analysis and fertilizer guidance to reduce input cost.',
    '1. Contact local agriculture office' || E'\n' || '2. Provide land details' || E'\n' || '3. Collect Soil Health Card after testing',
    NULL,
    true
  )
) AS v(name, description, eligibility, benefits, application_process, deadline, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.schemes s WHERE s.name = v.name
);

-- Seasonal calendar (sample year-round guidance)
INSERT INTO public.seasonal_calendar (month, crop_name, activity, tips)
SELECT v.month, v.crop_name, v.activity, v.tips
FROM (VALUES
  (1, 'Wheat', 'Irrigation & fertilizer', 'Apply irrigation around crown root initiation if moisture is low.'),
  (2, 'Wheat', 'Pest watch', 'Scout for aphids; prefer need-based spraying.'),
  (3, 'Wheat', 'Harvesting', 'Harvest when grains are hard and straw turns golden.'),
  (4, 'Cotton', 'Land preparation', 'Deep plough and incorporate organic matter before summer sowing.'),
  (5, 'Rice', 'Nursery preparation', 'Raise healthy nursery beds ahead of monsoon transplanting.'),
  (6, 'Rice', 'Transplanting', 'Transplant 21–30 day old seedlings with proper spacing.'),
  (6, 'Maize', 'Sowing', 'Sow with monsoon onset in well-drained fields.'),
  (7, 'Soybean', 'Weeding', 'First weeding 20–25 days after sowing improves yield.'),
  (8, 'Cotton', 'Pest management', 'Monitor bollworm; use IPM and avoid blanket sprays.'),
  (9, 'Rice', 'Disease watch', 'Watch for blast/blight in humid weather; keep drains clear.'),
  (10, 'Rice', 'Harvesting', 'Harvest at 80–85% maturity to reduce shattering losses.'),
  (11, 'Wheat', 'Sowing', 'Ideal sowing window in many plains: early to mid November.'),
  (11, 'Mustard', 'Sowing', 'Sow in a fine tilth seedbed with balanced basal fertilizer.'),
  (12, 'Wheat', 'First irrigation', 'Irrigate about 20–25 days after sowing if soil is dry.')
) AS v(month, crop_name, activity, tips)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.seasonal_calendar c
  WHERE c.month = v.month AND c.crop_name = v.crop_name AND c.activity = v.activity
);

-- Sample market prices (illustrative starter rows — replace with real mandi data)
INSERT INTO public.market_prices (crop_name, market_name, state, district, price_per_quintal, price_date)
SELECT v.crop_name, v.market_name, v.state, v.district, v.price_per_quintal, CURRENT_DATE
FROM (VALUES
  ('Wheat', 'APMC Mandi', 'Punjab', 'Ludhiana', 2425),
  ('Rice', 'APMC Mandi', 'Haryana', 'Karnal', 2680),
  ('Maize', 'APMC Mandi', 'Karnataka', 'Davangere', 2150),
  ('Cotton', 'APMC Mandi', 'Gujarat', 'Rajkot', 6800),
  ('Soybean', 'APMC Mandi', 'Madhya Pradesh', 'Indore', 4550),
  ('Sugarcane', 'Co-op Mill Yard', 'Uttar Pradesh', 'Muzaffarnagar', 350),
  ('Groundnut', 'APMC Mandi', 'Gujarat', 'Junagadh', 6200),
  ('Mustard', 'APMC Mandi', 'Rajasthan', 'Bharatpur', 5450)
) AS v(crop_name, market_name, state, district, price_per_quintal)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.market_prices p
  WHERE p.crop_name = v.crop_name
    AND p.market_name = v.market_name
    AND p.district = v.district
    AND p.price_date = CURRENT_DATE
);

-- Welcome notification
INSERT INTO public.notifications (title, message, notification_type, is_active)
SELECT
  'Welcome to Kisan Seva',
  'Check crop guides, schemes, live weather, and market prices from your dashboard. Update your profile district for better local weather.',
  'general',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.notifications n WHERE n.title = 'Welcome to Kisan Seva'
);
