CREATE TYPE public.app_role AS ENUM ('admin','seller','user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$fn$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE is_first boolean;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO is_first;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN is_first THEN 'admin'::public.app_role ELSE 'user'::public.app_role END)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$fn$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $fn$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$fn$;

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12,2),
  category TEXT NOT NULL DEFAULT 'Other',
  material TEXT,
  dimensions TEXT,
  weight TEXT,
  year TEXT,
  condition TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 1,
  images TEXT[] NOT NULL DEFAULT '{}',
  seller_name TEXT NOT NULL DEFAULT 'JadisArt Gallery',
  seller_location TEXT DEFAULT 'Paris, France',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published products are public" ON public.products FOR SELECT TO anon, authenticated USING (is_published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'contact',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT SELECT ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send inquiry" ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

INSERT INTO public.products (title, description, price, category, material, dimensions, weight, year, condition, stock_quantity, images, is_featured) VALUES
('Louis XV Gilded Console Table','A rare 18th-century French console in carved giltwood with a veined marble top. The scrollwork apron retains its original water gilding, softened by two and a half centuries of candlelight.',12500.00,'Furniture','Carved giltwood, Breche marble','120 x 45 x 88 cm','34 kg','c. 1755','Excellent, restored',1,ARRAY['/images/product-console.jpg'],true),
('Venetian Murano Glass Chandelier','Hand-blown Murano chandelier with twelve arms, amber and clear glass florets, and hand-applied gold leaf inclusions. A statement piece from the Rezzonico tradition.',8900.00,'Decorations','Murano glass, brass','90 x 90 x 110 cm','22 kg','c. 1910','Very good',1,ARRAY['/images/product-chandelier.jpg'],true),
('Dutch Golden Age Portrait of a Merchant','Oil on oak panel, unsigned, attributed to the circle of Frans Hals. Housed in a later ebonised frame with a discreet gilt slip.',24000.00,'Paintings','Oil on oak panel','58 x 71 cm framed','6 kg','c. 1640','Good, relined',1,ARRAY['/images/product-portrait.jpg'],true),
('Neoclassical Marble Bust of Athena','Finely carved Carrara marble bust after the antique, on a turned socle of grey Bardiglio. Grand Tour period.',6400.00,'Sculptures','Carrara marble','32 x 26 x 61 cm','41 kg','c. 1820','Excellent',1,ARRAY['/images/product-bust.jpg'],true),
('Roman Silver Denarius Collection','A curated set of nine silver denarii spanning Augustus to Marcus Aurelius, presented in a fitted mahogany coin cabinet with velvet trays.',4750.00,'Coins','Silver, mahogany case','24 x 18 x 5 cm','0.9 kg','27 BC - 180 AD','Fine to very fine',1,ARRAY['/images/product-coins.jpg'],true),
('Victorian Gold and Garnet Brooch','An 18ct gold brooch set with cabochon garnets and seed pearls in a floral spray, retaining its original fitted leather case.',2150.00,'Jewelry','18ct gold, garnet, seed pearl','5.5 x 4 cm','18 g','c. 1875','Excellent',1,ARRAY['/images/product-brooch.jpg'],true),
('First Edition Leather-Bound Folio','A handsome quarto in full calf with raised bands and gilt tooling, marbled endpapers, and an engraved frontispiece. Complete and unrestored.',3300.00,'Books','Calf leather, laid paper','21 x 28 x 6 cm','1.8 kg','1782','Good',1,ARRAY['/images/product-book.jpg'],false),
('Swiss Gold Pocket Watch with Hunter Case','18ct gold half-hunter pocket watch, key-wound movement with jewelled lever escapement, enamel dial and blued steel hands.',5600.00,'Watches','18ct gold, enamel','5 cm diameter','108 g','c. 1898','Very good, serviced',1,ARRAY['/images/product-watch.jpg'],true),
('Chinese Blue and White Porcelain Vase','A baluster vase painted in underglaze cobalt with lotus scrolls and a ruyi collar. Six-character mark to the base.',7800.00,'Ceramics','Porcelain','24 cm diameter x 46 cm','4.2 kg','19th century','Very good',1,ARRAY['/images/product-vase.jpg'],true),
('Antique Brass Nautical Sextant','A precision brass sextant with silvered arc, original shade glasses and telescope, in its fitted oak case with maker''s label.',1950.00,'Other','Brass, silvered scale, oak','26 x 24 x 13 cm','2.6 kg','c. 1880','Good, working',1,ARRAY['/images/product-sextant.jpg'],false);