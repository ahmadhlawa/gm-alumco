import type { LocalizedText } from '@/types';

// Static section copy for the homepage. Dynamic content (services, projects,
// testimonials, company numbers) comes from the backend API.
export interface SiteContent {
  about: {
    title: LocalizedText;
    subtitle: LocalizedText;
    description: LocalizedText;
    buttonText: LocalizedText;
  };
  services: {
    title: LocalizedText;
    subtitle: LocalizedText;
  };
  testimonials: {
    title: LocalizedText;
    subtitle: LocalizedText;
  };
}

export const siteContent: SiteContent = {
  about: {
    title: {
      en: "We Make the Difference in Every Detail",
      he: "אנחנו עושים את ההבדל בכל פרט"
    },
    subtitle: {
      en: "We are GM Aluminum Manufacturing & Trading Co., combining rich experience and modern technologies to deliver sustainable architectural solutions.",
      he: "אנחנו T.A.S, משלבים ניסיון עשיר וטכנולוגיות מתקדמות כדי לספק פתרונות אדריכליים בני קיימא."
    },
    description: {
      en: "For over a decade, T.A.S has delivered glass and aluminum solutions that exceed expectations. Our vision extends beyond installation to long-term architectural partnership.",
      he: "מזה למעלה מעשור, T.A.S מספקת פתרונות זכוכית ואלומיניום העולים על הציפיות, מתוך שותפות ארוכת טווח בבנייה אדריכלית."
    },
    buttonText: {
      en: "Learn More About Us",
      he: "קרא עוד עלינו"
    }
  },
  services: {
    title: {
      en: "Our Specialized Services",
      he: "השירותים המקצועיים שלנו"
    },
    subtitle: {
      en: "We offer a comprehensive package of aluminum and glass solutions to meet your needs.",
      he: "אנו מציעים חבילה מקיפה של פתרונות אלומיניום וזכוכית לענות על צרכי הפרויקטים שלכם."
    }
  },
  testimonials: {
    title: {
      en: "What Our Clients Say",
      he: "מה הלקוחות שלנו אומרים"
    },
    subtitle: {
      en: "Opinions and evaluations of our valued clients about our services.",
      he: "חוות דעת והערכות של לקוחותינו המוערכים על השירותים ורמת הביצוע."
    }
  }
};
