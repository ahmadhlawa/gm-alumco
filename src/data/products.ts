import type { Product } from '@/types';

export const products: Product[] = [
  {
    id: 'prod-1',
    slug: 'thermal-break-sliding-door',
    title: 'أبواب سحب عازلة للحرارة (Thermal Break)',
    category: 'أبواب ونوافذ',
    image: 'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&q=80',
    description: 'نظام أبواب سحب ألمنيوم متقدم مزود بتقنية كسر الجسر الحراري، يمنع انتقال الحرارة بالكامل من الخارج للداخل.',
    gallery: [
      'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&q=80'
    ],
    features: ['عزل حراري عالي', 'تصميم انسيابي', 'سلاسة في الفتح والإغلاق', 'مقاومة للماء والأتربة'],
    specs: {
      'سماكة القطاع': '120 ملم',
      'نوع الزجاج': 'مزدوج 24 ملم Low-E',
      'العزل الصوتي': 'حتى 40 ديسبل',
      'الأبعاد القصوى للدرفة': '3x3 متر'
    },
    suitableFor: ['الفلل الفاخرة', 'الشرفات الكبيرة', 'غرف المعيشة المطلة'],
    seoTitle: 'أبواب سحب عازلة للحرارة | منتجاتنا',
    seoDescription: 'دليل وشراء أبواب سحب ألمنيوم بنظام العزل الحراري Thermal Break.'
  },
  {
    id: 'prod-2',
    slug: 'frameless-glass-balustrade',
    title: 'درابزين زجاجي بدون إطار',
    category: 'درابزين وحواجز',
    image: 'https://images.unsplash.com/photo-1629074095400-b8c73c3325e7?auto=format&fit=crop&q=80',
    description: 'حواجز زجاجية سيكوريت مصممة لتوفير الحماية العالية دون تشويه المنظر العام الجمالي، مع تثبيت مخفي.',
    gallery: [
      'https://images.unsplash.com/photo-1629074095400-b8c73c3325e7?auto=format&fit=crop&q=80'
    ],
    features: ['رؤية كاملة بدون عوائق', 'زجاج مقسى آمن جداً', 'تثبيت سفلي مخفي من الألمنيوم', 'مقاوم للصدمات'],
    specs: {
      'سماكة الزجاج': '12 ملم إلى 20 ملم',
      'نظام التثبيت': 'مخفي في الأرضية',
      'تحمل الضغط': 'يتحمل صدمات قوية'
    },
    suitableFor: ['الشرفات الخارجية', 'حواف المسابح', 'السلالم المودرن']
  }
];
