-- Create payment_links table
CREATE TABLE public.payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  normal_price DECIMAL(15,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  final_price DECIMAL(15,2) NOT NULL,
  payment_methods TEXT[] NOT NULL DEFAULT '{}',
  bank_bri_account TEXT,
  bank_mandiri_account TEXT,
  qris_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment_status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'confirmed', 'rejected');

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_link_id UUID REFERENCES public.payment_links(id) ON DELETE CASCADE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_whatsapp TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  proof_image_url TEXT,
  status payment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_links (public read for valid links)
CREATE POLICY "Anyone can view payment links" ON public.payment_links
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create payment links" ON public.payment_links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update payment links" ON public.payment_links
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete payment links" ON public.payment_links
  FOR DELETE USING (true);

-- RLS Policies for payments
CREATE POLICY "Anyone can view payments" ON public.payments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create payments" ON public.payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update payments" ON public.payments
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete payments" ON public.payments
  FOR DELETE USING (true);

-- Create storage bucket for QRIS images
INSERT INTO storage.buckets (id, name, public) VALUES ('qris-images', 'qris-images', true);

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true);

-- Storage policies
CREATE POLICY "Anyone can upload QRIS images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'qris-images');

CREATE POLICY "Anyone can view QRIS images" ON storage.objects
  FOR SELECT USING (bucket_id = 'qris-images');

CREATE POLICY "Anyone can upload payment proofs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Anyone can view payment proofs" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-proofs');