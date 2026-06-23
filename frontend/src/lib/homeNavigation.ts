export const HOME_SECTION_IDS = ['home', 'about', 'services', 'projects', 'partners'] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

type ScrollElement = Pick<Element, 'scrollIntoView'>;
type GetElement = (id: string) => ScrollElement | null;

export function getHomeNavigationAction(pathname: string, target: HomeSectionId) {
  if (pathname === '/') {
    return { type: 'scroll' as const, target };
  }

  return {
    type: 'navigate' as const,
    to: '/',
    state: { scrollTo: target },
  };
}

export function scrollToHomeSection(
  target: HomeSectionId,
  getElement: GetElement = (id) => document.getElementById(id),
): boolean {
  const element = getElement(target);
  if (!element) return false;

  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}
