import type { Project } from '@/types';

export const projects: Project[] = [
  {
    id: "proj-1",
    slug: "modern-commercial-tower",
    title: "برج الأعمال الحديث",
    category: "مكاتب تجارية",
    location: "الرياض، السعودية",
    year: "2023",
    shortDescription: "تصميم وتنفيذ واجهات زجاجية متكاملة لبرج أعمال مكون من 25 طابقًا.",
    description: "في هذا المشروع، قمنا بتنفيذ واجهات زجاجية متكاملة حديثة مع أنظمة ألمنيوم متطورة لعزل الحرارة والصوت. تم استخدام نظام Curtain Wall لتوفير مظهر إنسيابي من الخارج، وإدخال أكبر قدر من الإضاءة الطبيعية للمكاتب. تغطي الواجهات مساحة تزيد عن 15,000 متر مربع.",
    mainImage: "https://images.unsplash.com/photo-1541885669742-fc14a600c6d8?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80",
    ],
    featured: true,
    tags: ["كيرتن وول", "زجاج عازل", "واجهات تجارية"],
    seoTitle: "برج الأعمال الحديث | مشاريع أفق الألمنيوم",
    seoDescription: "تفاصيل مشروع تصميم وتنفيذ برج الأعمال الحديث في الرياض باستخدام أنظمة واجهات زجاجية متطورة."
  },
  {
    id: "proj-2",
    slug: "luxury-residence-villa",
    title: "فيلا الريفيرا السكنية",
    category: "فلل سكنية",
    location: "جدة، السعودية",
    year: "2024",
    shortDescription: "تنفيذ النوافذ، الأبواب، والدرابزين الزجاجي لفيلا فاخرة.",
    description: "طلب العميل تصميماً يجمع بين العصرية والأناقة بألوان تتناسق مع البيئة البحرية. استخدمنا قطاعات ألمنيوم عالية السماكة مع زجاج مزدوج Low-E للحفاظ على برودة التكييف داخل الفيلا وتقليل استهلاك الطاقة. كما تم تركيب شبابيك سحاب بأحجام كبيرة تطل على المسبح الخارجي.",
    mainImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1600607687931-ce8e7784f183?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600607687644-bcaec3f58ea9?auto=format&fit=crop&q=80",
    ],
    featured: true,
    tags: ["أبواب سحاب", "زجاج سيكوريت", "درابزين زجاجي", "سكني"],
    seoTitle: "فيلا الريفيرا السكنية | مشاريع أفق الألمنيوم",
    seoDescription: "تفاصيل العمل على مشروع فيلا الريفيرا حيث تم تركيب وتصنيع زجاج عازل وأبواب ألمنيوم سحاب."
  },
  {
    id: "proj-3",
    slug: "shopping-mall-facade",
    title: "واجهة مول السيف التجارية",
    category: "مراكز تسوق",
    location: "الخبر، السعودية",
    year: "2022",
    shortDescription: "تركيب واجهات كلادينج وزجاج مقسى למركز تسوق كبير.",
    description: "بمساحة عمل تتجاوز 8,000 متر مربع، قمنا بتنفيذ تجليد كامل لواجهة المول الخارجية باستخدام ألواح الكلادينج المقاومة للحرائق، إلى جانب تركيب أبواب زجاجية أوتوماتيكية عند المداخل الرئيسية، وزجاج سيكوريت عالي الشفافية لواجهات المحلات التجارية.",
    mainImage: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1473283147055-e39c51470b09?auto=format&fit=crop&q=80"
    ],
    featured: false,
    tags: ["كلادينج", "أبواب أوتوماتيكية", "واجهات معارض"],
  }
];
