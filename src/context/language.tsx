import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en" | "fr" | "ar";

const STORAGE_KEY = "jadisart:language";

const translations = {
  en: {
    "nav.home": "Home", "nav.marketplace": "Marketplace", "nav.categories": "Categories", "nav.about": "About", "nav.contact": "Contact", "nav.support": "Customer service", "nav.dashboard": "Dashboard",
    "a11y.account": "Sign in or view account", "a11y.cart": "Shopping cart", "a11y.menu": "Toggle navigation", "a11y.language": "Choose language", "auth.signOut": "Sign out",
    "home.eyebrow": "Established for the long-lived", "home.title.before": "Objects that have already", "home.title.gold": "outlived a century", "home.intro": "JadisArt brings together antiques, vintage design and historical curiosities from trusted European dealers — each authenticated, documented and ready for its next chapter.", "home.browse": "Browse the collection", "home.story": "Our story", "home.piecesPlaced": "Pieces placed", "home.dealers": "Partner dealers", "home.authenticated": "Authenticated",
    "home.featuredEyebrow": "Currently on view", "home.featured": "Featured antiques", "home.viewAll": "View all pieces", "home.categoriesEyebrow": "Explore by discipline", "home.categories": "Categories", "home.categoriesIntro": "Discover objects with history, curated across ten specialist collections.", "home.exploreCategory": "Explore collection",
    "home.standard": "The JadisArt standard", "home.why": "Why choose JadisArt", "home.aboutEyebrow": "About the company", "home.aboutTitle": "A dealer’s eye, a collector’s patience", "home.readStory": "Read our story", "home.specialist": "Speak with a specialist", "home.testimonialsEyebrow": "Collectors on JadisArt", "home.testimonials": "Trusted by careful buyers",
    "market.eyebrow": "The catalogue", "market.title": "Marketplace", "market.intro": "authenticated pieces, selected by our specialists. Search instantly, filter by material or price, and sort to taste.", "market.filters": "Filters", "market.category": "Category", "market.allCategories": "All categories", "market.material": "Material", "market.allMaterials": "All materials", "market.maxPrice": "Max price", "market.reset": "Reset filters", "market.search": "Search antiques", "market.searchPlaceholder": "Search by title, material or description…", "market.sort": "Sort by", "market.newest": "Newest first", "market.oldest": "Oldest first", "market.priceAsc": "Price: low to high", "market.priceDesc": "Price: high to low", "market.piece": "piece", "market.pieces": "pieces", "market.found": "found", "market.empty": "Nothing matches that search", "market.emptyHint": "Try widening the price range or clearing the filters.", "market.previous": "Previous", "market.next": "Next",
    "product.material": "Material", "product.size": "Size", "product.weight": "Weight", "product.view": "View details", "product.add": "Add to cart", "product.added": "added to your cart",
    "newsletter.eyebrow": "The Collector’s Letter", "newsletter.title": "First look at every new acquisition", "newsletter.body": "One considered email each month: newly authenticated pieces, private viewings and notes from our restorers.", "newsletter.email": "Email address", "newsletter.join": "Subscribe", "newsletter.joining": "Joining…",
    "footer.about": "A curated marketplace for antiques, vintage design, collectibles and objects with a history worth keeping.", "footer.explore": "Explore", "footer.aboutLink": "About JadisArt", "footer.contact": "Contact & FAQ", "footer.cart": "Shopping cart", "footer.categories": "Categories", "footer.gallery": "Gallery", "footer.rights": "All rights reserved.",
  },
  fr: {
    "nav.home": "Accueil", "nav.marketplace": "Galerie", "nav.categories": "Catégories", "nav.about": "À propos", "nav.contact": "Contact", "nav.support": "Service client", "nav.dashboard": "Tableau de bord",
    "a11y.account": "Se connecter ou voir le compte", "a11y.cart": "Panier", "a11y.menu": "Ouvrir la navigation", "a11y.language": "Choisir la langue", "auth.signOut": "Se déconnecter",
    "home.eyebrow": "Créé pour traverser le temps", "home.title.before": "Des objets qui ont déjà", "home.title.gold": "traversé un siècle", "home.intro": "JadisArt réunit antiquités, design vintage et curiosités historiques de marchands européens de confiance — chaque pièce est authentifiée, documentée et prête pour son prochain chapitre.", "home.browse": "Découvrir la collection", "home.story": "Notre histoire", "home.piecesPlaced": "Pièces confiées", "home.dealers": "Marchands partenaires", "home.authenticated": "Authentifiées",
    "home.featuredEyebrow": "Actuellement exposées", "home.featured": "Antiquités à la une", "home.viewAll": "Voir toutes les pièces", "home.categoriesEyebrow": "Explorer par discipline", "home.categories": "Catégories", "home.categoriesIntro": "Découvrez des objets chargés d’histoire, réunis dans dix collections spécialisées.", "home.exploreCategory": "Explorer la collection",
    "home.standard": "L’exigence JadisArt", "home.why": "Pourquoi choisir JadisArt", "home.aboutEyebrow": "À propos de la maison", "home.aboutTitle": "L’œil d’un marchand, la patience d’un collectionneur", "home.readStory": "Lire notre histoire", "home.specialist": "Parler à un spécialiste", "home.testimonialsEyebrow": "Les collectionneurs témoignent", "home.testimonials": "La confiance des connaisseurs",
    "market.eyebrow": "Le catalogue", "market.title": "Galerie", "market.intro": "pièces authentifiées, sélectionnées par nos spécialistes. Recherchez instantanément et filtrez par matière ou prix.", "market.filters": "Filtres", "market.category": "Catégorie", "market.allCategories": "Toutes les catégories", "market.material": "Matière", "market.allMaterials": "Toutes les matières", "market.maxPrice": "Prix maximum", "market.reset": "Réinitialiser", "market.search": "Rechercher des antiquités", "market.searchPlaceholder": "Rechercher par titre, matière ou description…", "market.sort": "Trier par", "market.newest": "Plus récentes", "market.oldest": "Plus anciennes", "market.priceAsc": "Prix croissant", "market.priceDesc": "Prix décroissant", "market.piece": "pièce", "market.pieces": "pièces", "market.found": "trouvées", "market.empty": "Aucun résultat", "market.emptyHint": "Élargissez la plage de prix ou réinitialisez les filtres.", "market.previous": "Précédent", "market.next": "Suivant",
    "product.material": "Matière", "product.size": "Dimensions", "product.weight": "Poids", "product.view": "Voir le détail", "product.add": "Ajouter au panier", "product.added": "ajouté au panier",
    "newsletter.eyebrow": "La Lettre du Collectionneur", "newsletter.title": "Découvrez chaque nouvelle acquisition en avant-première", "newsletter.body": "Un message choisi chaque mois : nouvelles pièces authentifiées, visites privées et notes de nos restaurateurs.", "newsletter.email": "Adresse e-mail", "newsletter.join": "S’abonner", "newsletter.joining": "Inscription…",
    "footer.about": "Une galerie d’antiquités, de design vintage et d’objets de collection dont l’histoire mérite d’être préservée.", "footer.explore": "Explorer", "footer.aboutLink": "À propos de JadisArt", "footer.contact": "Contact et FAQ", "footer.cart": "Panier", "footer.categories": "Catégories", "footer.gallery": "Galerie", "footer.rights": "Tous droits réservés.",
  },
  ar: {
    "nav.home": "الرئيسية", "nav.marketplace": "المعرض", "nav.categories": "الفئات", "nav.about": "من نحن", "nav.contact": "اتصل بنا", "nav.support": "خدمة العملاء", "nav.dashboard": "لوحة التحكم",
    "a11y.account": "تسجيل الدخول أو عرض الحساب", "a11y.cart": "سلة التسوق", "a11y.menu": "فتح قائمة التنقل", "a11y.language": "اختيار اللغة", "auth.signOut": "تسجيل الخروج",
    "home.eyebrow": "قطع خُلقت لتدوم", "home.title.before": "قطع فنية عاشت بالفعل", "home.title.gold": "أكثر من قرن", "home.intro": "تجمع جاديس آرت التحف والتصاميم العتيقة والنوادر التاريخية من تجار أوروبيين موثوقين — كل قطعة موثقة ومصادق عليها وجاهزة لفصلها الجديد.", "home.browse": "اكتشف المجموعة", "home.story": "قصتنا", "home.piecesPlaced": "قطعة مقتناة", "home.dealers": "تاجراً شريكاً", "home.authenticated": "موثقة",
    "home.featuredEyebrow": "معروضة حالياً", "home.featured": "تحف مختارة", "home.viewAll": "عرض كل القطع", "home.categoriesEyebrow": "استكشف حسب التخصص", "home.categories": "الفئات", "home.categoriesIntro": "اكتشف قطعاً تحمل تاريخاً عريقاً ضمن عشر مجموعات متخصصة.", "home.exploreCategory": "استكشف المجموعة",
    "home.standard": "معايير جاديس آرت", "home.why": "لماذا تختار جاديس آرت", "home.aboutEyebrow": "عن الدار", "home.aboutTitle": "عين الخبير وصبر جامع التحف", "home.readStory": "اقرأ قصتنا", "home.specialist": "تحدث مع خبير", "home.testimonialsEyebrow": "آراء جامعي التحف", "home.testimonials": "ثقة أهل الخبرة",
    "market.eyebrow": "الكتالوج", "market.title": "المعرض", "market.intro": "قطعة موثقة اختارها خبراؤنا. ابحث فوراً وصفِّ حسب الخامة أو السعر.", "market.filters": "التصفية", "market.category": "الفئة", "market.allCategories": "كل الفئات", "market.material": "الخامة", "market.allMaterials": "كل الخامات", "market.maxPrice": "أقصى سعر", "market.reset": "إعادة ضبط", "market.search": "ابحث في التحف", "market.searchPlaceholder": "ابحث بالعنوان أو الخامة أو الوصف…", "market.sort": "الترتيب", "market.newest": "الأحدث أولاً", "market.oldest": "الأقدم أولاً", "market.priceAsc": "السعر: من الأقل", "market.priceDesc": "السعر: من الأعلى", "market.piece": "قطعة", "market.pieces": "قطع", "market.found": "متاحة", "market.empty": "لا توجد نتائج مطابقة", "market.emptyHint": "جرّب توسيع نطاق السعر أو مسح عوامل التصفية.", "market.previous": "السابق", "market.next": "التالي",
    "product.material": "الخامة", "product.size": "الأبعاد", "product.weight": "الوزن", "product.view": "عرض التفاصيل", "product.add": "أضف إلى السلة", "product.added": "تمت إضافته إلى سلتك",
    "newsletter.eyebrow": "رسالة جامع التحف", "newsletter.title": "كن أول من يكتشف مقتنياتنا الجديدة", "newsletter.body": "رسالة منتقاة كل شهر: قطع موثقة حديثاً، معاينات خاصة وملاحظات من خبراء الترميم.", "newsletter.email": "البريد الإلكتروني", "newsletter.join": "اشترك", "newsletter.joining": "جارٍ الاشتراك…",
    "footer.about": "معرض منتقى للتحف والتصاميم العتيقة والمقتنيات والقطع ذات التاريخ الجدير بالحفظ.", "footer.explore": "استكشف", "footer.aboutLink": "عن جاديس آرت", "footer.contact": "اتصل بنا والأسئلة", "footer.cart": "سلة التسوق", "footer.categories": "الفئات", "footer.gallery": "المعرض", "footer.rights": "جميع الحقوق محفوظة.",
  },
} as const;

export const categoryLabels: Record<Language, Record<string, string>> = {
  en: { Furniture: "Furniture", Decorations: "Decorative Arts", Paintings: "Paintings", Sculptures: "Sculptures", Coins: "Coins", Jewelry: "Jewelry", Books: "Rare Books", Watches: "Watches", Ceramics: "Ceramics", Other: "Objects of Art" },
  fr: { Furniture: "Mobilier", Decorations: "Décoration", Paintings: "Peintures", Sculptures: "Sculptures", Coins: "Monnaies", Jewelry: "Bijoux", Books: "Livres rares", Watches: "Montres", Ceramics: "Céramiques", Other: "Objets d’art" },
  ar: { Furniture: "الأثاث", Decorations: "الديكور", Paintings: "اللوحات", Sculptures: "المنحوتات", Coins: "العملات", Jewelry: "المجوهرات", Books: "الكتب النادرة", Watches: "الساعات", Ceramics: "الخزف", Other: "التحف الفنية" },
};

type TranslationKey = keyof typeof translations.en;
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string; categoryName: (category: string) => string };

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "fr" || saved === "ar") setLanguageState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: (key) => translations[language][key] ?? translations.en[key], categoryName: (category) => categoryLabels[language][category] ?? category }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}