import { Product, GalleryImage, Client, Testimonial, BlogPost } from '@/types';

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    slug: "thermal-break-sliding-door",
    title: "أبواب سحب عازلة للحرارة (Thermal Break)",
    category: "أبواب ونوافذ",
    image: "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&q=80",
    description: "نظام أبواب سحب ألمنيوم متقدم مزود بتقنية كسر الجسر الحراري، يمنع انتقال الحرارة بالكامل من الخارج للداخل.",
    gallery: [
      "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&q=80"
    ],
    features: ["عزل حراري عالي", "تصميم انسيابي", "سلاسة في الفتح والإغلاق", "مقاومة للماء والأتربة"],
    specs: {
      "سماكة القطاع": "120 ملم",
      "نوع الزجاج": "مزدوج 24 ملم Low-E",
      "العزل الصوتي": "حتى 40 ديسبل",
      "الأبعاد القصوى للدرفة": "3x3 متر"
    },
    suitableFor: ["الفلل الفاخرة", "الشرفات الكبيرة", "غرف المعيشة المطلة"],
    seoTitle: "أبواب سحب عازلة للحرارة | منتجاتنا",
    seoDescription: "دليل وشراء أبواب سحب ألمنيوم بنظام العزل الحراري Thermal Break."
  },
  {
    id: "prod-2",
    slug: "frameless-glass-balustrade",
    title: "درابزين زجاجي بدون إطار",
    category: "درابزين وحواجز",
    image: "https://images.unsplash.com/photo-1629074095400-b8c73c3325e7?auto=format&fit=crop&q=80",
    description: "حواجز زجاجية سيكوريت مصممة لتوفير الحماية العالية دون تشويه المنظر العام الجمالي، مع تثبيت مخفي.",
    gallery: [
      "https://images.unsplash.com/photo-1629074095400-b8c73c3325e7?auto=format&fit=crop&q=80"
    ],
    features: ["رؤية كاملة بدون عوائق", "زجاج مقسى آمن جداً", "تثبيت سفلي مخفي من الألمنيوم", "مقاوم للصدمات"],
    specs: {
      "سماكة الزجاج": "12 ملم إلى 20 ملم",
      "نظام التثبيت": "مخفي في الأرضية",
      "تحمل الضغط": "يتحمل صدمات قوية"
    },
    suitableFor: ["الشرفات الخارجية", "حواف المسابح", "السلالم المودرن"],
  }
];

export const mockGallery: GalleryImage[] = [
  { id: "g1", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80", alt: "واجهة زجاجية", category: "واجهات" },
  { id: "g2", url: "https://images.unsplash.com/photo-1600607687931-ce8e7784f183?auto=format&fit=crop&q=80", alt: "شبابيك فلل", category: "نوافذ" },
  { id: "g3", url: "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&q=80", alt: "أبواب سحاب", category: "أبواب" },
  { id: "g4", url: "https://images.unsplash.com/photo-1629074095400-b8c73c3325e7?auto=format&fit=crop&q=80", alt: "درابزين زجاج", category: "درابزين" },
];

export const mockClients: Client[] = [
  { id: "c1", name: "شركة الإنشاءات الكبرى", logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80" },
  { id: "c2", name: "مجموعة دارك العقارية", logo: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=300&q=80" },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: "ts-1",
    name: "م. محمد عبد الله",
    role: "مدير مشاريع",
    company: "شركة البناء الحديث",
    content: "تعاملت مع الشركة في توريد وتركيب قواطع الكيرتن وول لبرج تجاري، وكان الالتزام بالوقت وجودة التشطيبات تفوق التوقعات. فريق عمل هندسي على مستوى عالي.",
    rating: 5
  },
  {
    id: "ts-2",
    name: "سارة العتيبي",
    role: "مالكة فيلا",
    content: "تجربة ممتازة في تركيب النوافذ العازلة وأبواب السحب في منزلي الجديد، العزل الصوتي والحراري فرق معي جداً. أوصي بهم بشدة.",
    rating: 5
  }
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: "post-1",
    slug: "benefits-of-thermal-break-windows",
    title: "ما هي نوافذ كسر الجسر الحراري ولماذا هي مهمة لمنزلك؟",
    date: "2024-05-15",
    category: "نصائح وإرشادات",
    image: "https://images.unsplash.com/photo-1600607687827-ce8e7784f183?auto=format&fit=crop&q=80",
    excerpt: "تعرف على تقنية عزل الحرارة في نوافذ الألمنيوم وكيف يمكنها توفير فواتير الكهرباء بشكل ملحوظ.",
    content: "محتوى المقال كاملاً يوضح تقنية الألمنيوم العازل (Thermal Break)..."
  }
];
