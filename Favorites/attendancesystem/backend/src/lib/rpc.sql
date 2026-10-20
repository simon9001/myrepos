-- Run this in your Supabase SQL editor alongside schema.sql.
-- Provides an atomic QR scan count increment (race-condition safe).

CREATE OR REPLACE FUNCTION public.increment_qr_scan_count(qr_code TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER AS $$
  UPDATE public.qr_codes
  SET scan_count = scan_count + 1
  WHERE code = qr_code;
$$;
