ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS price_type TEXT NOT NULL DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'on_request', 'contact')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique ON public.products (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS products_status_created_at_idx ON public.products (status, created_at DESC);

UPDATE public.products SET status = CASE WHEN is_published THEN 'published' ELSE 'draft' END WHERE status IS NULL;

DROP POLICY IF EXISTS "published products are public" ON public.products;
CREATE POLICY "published products are public" ON public.products
  FOR SELECT TO anon, authenticated
  USING ((is_published = true AND status = 'published') OR public.has_role(auth.uid(), 'admin'));

INSERT INTO storage.buckets (id, name, public)
VALUES ('antiquity-images', 'antiquity-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public antiquity images are readable" ON storage.objects;
CREATE POLICY "public antiquity images are readable" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'antiquity-images');

DROP POLICY IF EXISTS "admins upload antiquity images" ON storage.objects;
CREATE POLICY "admins upload antiquity images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'antiquity-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins update antiquity images" ON storage.objects;
CREATE POLICY "admins update antiquity images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'antiquity-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'antiquity-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins delete antiquity images" ON storage.objects;
CREATE POLICY "admins delete antiquity images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'antiquity-images' AND public.has_role(auth.uid(), 'admin'));
