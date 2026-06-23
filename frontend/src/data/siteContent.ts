import type { LocalizedText } from '@/types';

export type { LocalizedText } from '@/types';

export interface SiteStats {
  id: string;
  value: string;
  label: LocalizedText;
}

export interface SiteContent {
  hero: {
    logoText: LocalizedText;
    badge: LocalizedText;
    headline: LocalizedText;
    subtitle: LocalizedText;
    primaryCta: {
      label: LocalizedText;
      href: string;
    };
    secondaryCta: {
      label: LocalizedText;
      href: string;
    };
    backgroundImage: string;
    featuredProject: {
      badge: LocalizedText;
      title: LocalizedText;
      description: LocalizedText;
      image: string;
    };
    stats: SiteStats[];
  };
  about: {
    title: LocalizedText;
    subtitle: LocalizedText;
    description: LocalizedText;
    buttonText: LocalizedText;
    stats: SiteStats[];
  };
  services: {
    title: LocalizedText;
    subtitle: LocalizedText;
  };
  projects: {
    title: LocalizedText;
    subtitle: LocalizedText;
  };
  products: {
    title: LocalizedText;
    subtitle: LocalizedText;
  };
  gallery: {
    title: LocalizedText;
    subtitle: LocalizedText;
  };
  partners: {
    title: LocalizedText;
    subtitle: LocalizedText;
  };
  testimonials: {
    title: LocalizedText;
    subtitle: LocalizedText;
  };
  contact: {
    title: LocalizedText;
    subtitle: LocalizedText;
    address: LocalizedText;
    phone: string;
    email: string;
  };
  footer: {
    description: LocalizedText;
    copyright: LocalizedText;
  };
}

export const initialSiteContent: SiteContent = {
  hero: {
    logoText: {
      ar: "T.A.S",
      en: "T.A.S",
      he: "T.A.S"
    },
    badge: {
      ar: "ريادة هندسية منذ ٢٠١٤",
      en: "Engineering Excellence Since 2014",
      he: "מצוינות הנדסית מאז 2014"
    },
    headline: {
      ar: "حلول الألمنيوم والزجاج للمشاريع المعمارية الفاخرة",
      en: "Aluminum and Glass Solutions for Luxury Architectural Projects",
      he: "פתרונות אלומיניום וזכוכית לפרויקטים אדריכליים יוקרתיים"
    },
    subtitle: {
      ar: "تصميم، تصنيع وتركيب أنظمة ألمنيوم وزجاج بمعايير هندسية عالمية. واجهات زجاجية، أبواب سحابة، وحلول مخصصة للفلل والقصور.",
      en: "Design, manufacturing and installation of aluminum and glass systems with international engineering standards. Glass facades, sliding doors, and custom solutions for villas and palaces.",
      he: "תכנון, ייצור והתקנה של מערכות אלומיניום וזכוכית בסטנדרטים הנדסיים בינלאומיים. קירות מסך, דלתות הזזה ופתרונות מותאמים אישית לווילות וארמונות."
    },
    primaryCta: {
      label: {
        ar: "شاهد مشاريعنا",
        en: "View Our Projects",
        he: "צפה בפרויקטים שלנו"
      },
      href: "/projects"
    },
    secondaryCta: {
      label: {
        ar: "خدماتنا الهندسية",
        en: "Our Engineering Services",
        he: "השירותים ההנדסיים שלנו"
      },
      href: "/services"
    },
    backgroundImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1000&auto=format&fit=crop",
    featuredProject: {
      badge: {
        ar: "مشروع مميز",
        en: "Featured Project",
        he: "פרויקט נבחר"
      },
      title: {
        ar: "برج الأعمال الزجاجي - دبي",
        en: "Glass Business Tower - Dubai",
        he: "מגדל עסקים מזכוכית - דובאי"
      },
      description: {
        ar: "تنفيذ واجهات Curtain Wall بالكامل",
        en: "Full Curtain Wall facade implementation",
        he: "ביצוע מלא של חזיתות Curtain Wall"
      },
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
    },
    stats: [
      {
        id: "completed-projects",
        value: "٢٥٠+",
        label: {
          ar: "مشروع مكتمل",
          en: "Completed Projects",
          he: "פרויקטים שהושלמו"
        }
      },
      {
        id: "years-experience",
        value: "١٠+",
        label: {
          ar: "سنوات خبرة",
          en: "Years of Experience",
          he: "שנות ניסיון"
        }
      },
      {
        id: "warranty-years",
        value: "٥",
        label: {
          ar: "سنوات ضمان",
          en: "Years Warranty",
          he: "שנות אחריות"
        }
      }
    ]
  },
  about: {
    title: {
      ar: "نصنع الفرق في كل تفصيلة",
      en: "We Make the Difference in Every Detail",
      he: "אנחנו עושים את ההבדל בכל פרט"
    },
    subtitle: {
      ar: "نحن شركة T.A.S، نجمع بين الخبرة العريقة وأحدث التقنيات لتقديم حلول معمارية مستدامة.",
      en: "We are GM Aluminum Manufacturing & Trading Co., combining rich experience and modern technologies to deliver sustainable architectural solutions.",
      he: "אנחנו T.A.S, משלבים ניסיון עשיר וטכנולוגיות מתקדמות כדי לספק פתרונות אדריכליים בני קיימא."
    },
    description: {
      ar: "على مدار أكثر من عقد من الزمان، التزمنا في T.A.S بتقديم حلول زجاجية وألمنيوم تتجاوز التوقعات. رؤيتنا لا تقتصر على التركيب، بل تمتد لتكون شراكة في بناء معالم معمارية تصمد أمام اختبار الزمن.",
      en: "For over a decade, T.A.S has delivered glass and aluminum solutions that exceed expectations. Our vision extends beyond installation to long-term architectural partnership.",
      he: "מזה למעלה מעשור, T.A.S מספקת פתרונות זכוכית ואלומיניום העולים על הציפיות, מתוך שותפות ארוכת טווח בבנייה אדריכלית."
    },
    buttonText: {
      ar: "تعرف علينا أكثر",
      en: "Learn More About Us",
      he: "קרא עוד עלינו"
    },
    stats: [
      {
        id: "about-completed",
        value: "٢٥٠+",
        label: {
          ar: "مشاريع مكتملة",
          en: "Completed Projects",
          he: "פרויקטים שהושלמו"
        }
      },
      {
        id: "about-experience",
        value: "١٠+",
        label: {
          ar: "سنوات خبرة",
          en: "Years of Experience",
          he: "שנות ניסיון"
        }
      },
      {
        id: "about-team",
        value: "٤٠+",
        label: {
          ar: "فريق مختص",
          en: "Expert Team",
          he: "צוות מומחים"
        }
      },
      {
        id: "about-warranty",
        value: "١٠٠%",
        label: {
          ar: "ضمان جودة",
          en: "Quality Warranty",
          he: "אחריות איכות"
        }
      }
    ]
  },
  services: {
    title: {
      ar: "خدماتنا المتخصصة",
      en: "Our Specialized Services",
      he: "השירותים המקצועיים שלנו"
    },
    subtitle: {
      ar: "نقدم باقة متكاملة من حلول الألمنيوم والزجاج لتلبي احتياجات مشاريعكم.",
      en: "We offer a comprehensive package of aluminum and glass solutions to meet your needs.",
      he: "אנו מציעים חבילה מקיפה של פתרונות אלומיניום וזכוכית לענות על צרכי הפרויקטים שלכם."
    }
  },
  projects: {
    title: {
      ar: "مشاريعنا المميزة",
      en: "Our Featured Projects",
      he: "הפרויקטים המיוחדים שלנו"
    },
    subtitle: {
      ar: "نستعرض بعضاً من أعمالنا التي تعكس التزامنا بالجودة والابتكار.",
      en: "We showcase some of our work that reflects our commitment to quality and innovation.",
      he: "אנו מציגים כמה מהעבודות שלנו המשקפות את המחויבות שלנו לאיכות וחדשנות."
    }
  },
  products: {
    title: {
      ar: "منتجاتنا الرئيسية",
      en: "Our Primary Products",
      he: "המוצרים העיקריים שלנו"
    },
    subtitle: {
      ar: "تعرف على مجموعتنا من الأنظمة المعمارية.",
      en: "Learn about our range of architectural systems.",
      he: "למדו עוד על מגוון המערכות האדריכליות שלנו."
    }
  },
  gallery: {
    title: {
      ar: "معرض الصور",
      en: "Photo Gallery",
      he: "גלריית תמונות"
    },
    subtitle: {
      ar: "بعض من لقطات حية لأعمال التركيبات والتشطيبات.",
      en: "Live shots of our installation and finish works.",
      he: "צילומים חיים של עבודות ההתקנה והגימור שלנו."
    }
  },
  partners: {
    title: {
      ar: "شركاء النجاح",
      en: "Success Partners",
      he: "שותפי הצלחה"
    },
    subtitle: {
      ar: "نفخر بثقة كبرى الشركات والجهات التي اخترنا لنكون شركائهم.",
      en: "We are proud of the trust of major companies and institutions that chose us.",
      he: "אנו גאים באמון של חברות ומוסדות מובילים שבחרו בנו כשותפים שלהם."
    }
  },
  testimonials: {
    title: {
      ar: "ماذا يقول عملاؤنا",
      en: "What Our Clients Say",
      he: "מה הלקוחות שלנו אומרים"
    },
    subtitle: {
      ar: "آراء وتقييمات عملائنا الكرام عن خدماتنا ومستوى التنفيذ.",
      en: "Opinions and evaluations of our valued clients about our services.",
      he: "חוות דעת והערכות של לקוחותינו המוערכים על השירותים ורמת הביצוע."
    }
  },
  contact: {
    title: {
      ar: "تواصل معنا",
      en: "Contact Us",
      he: "צור קשר"
    },
    subtitle: {
      ar: "نحن هنا لمساعدتكم في تحويل رؤيتكم إلى واقع ملموس. اتصل بنا اليوم للحصول على استشارة هيدسية مجانية.",
      en: "We are here to help you turn your vision into reality. Contact us today for a free engineering consultation.",
      he: "אנחנו כאן כדי לעזור לכם להפוך את החזון שלכם למציאות. צרו קשר עוד היום לייעוץ הנדסי חינם."
    },
    address: {
      ar: "المنطقة الصناعية، شارع الملك فهد، الرياض، المملكة العربية السعودية",
      en: "Industrial Area, King Fahd Road, Riyadh, Saudi Arabia",
      he: "אזור התעשייה, כביש המלך פהד, ריאד, ערב הסעודית"
    },
    phone: "+966 50 123 4567",
    email: "info@alu-horizon.com"
  },
  footer: {
    description: {
      ar: "شركة رائدة متخصصة في تصميم وتصنيع وتركيب أنظمة الألمنيوم والزجاج المتطورة للمشاريع السكنية والتجارية بصمة معمارية فريدة.",
      en: "A leading company specialized in design, manufacturing, and installation of advanced aluminum and glass systems for residential and commercial projects with a unique architectural fingerprint.",
      he: "חברה מובילה המתמחה בתכנון, ייצור והתקנה של מערכות אלומיניום וזכוכית מתקדמות לפרויקטים למגורים ומסחר עם טביעת אצבע אדריכלית ייחודית."
    },
    copyright: {
      ar: "شركة T.A.S. جميع الحقوق محفوظة.",
      en: "GM Aluminum Manufacturing & Trading Co. All rights reserved.",
      he: "T.A.S. כל הזכויות שמורות."
    }
  }
};

export const getCompanyStats = (translate: (ar: string, he?: string, en?: string) => string) => [
  { label: translate('سنوات من الخبرة', 'שנות נסיון'), value: '+15' },
  { label: translate('مشروع منجز', 'פרויקטים שהושלמו'), value: '+350' },
  { label: translate('عميل سعيد', 'לקוחות מרוצים'), value: '+200' },
  { label: translate('فريق هندسي متخصص', 'צוות מהנדסים מומחים'), value: '+40' }
];

// TODO(backend): Replace preview storage with versioned draft and publish APIs.
const STORAGE_KEY = "tas_site_content";

export function loadSiteContent(): SiteContent {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return initialSiteContent;
    }
  }
  return initialSiteContent;
}

export function saveSiteContent(content: SiteContent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}
