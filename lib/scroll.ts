export function scrollToSection(sectionId: string) {
  if (typeof window === 'undefined') return;

  const target = document.getElementById(sectionId);
  if (!target) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start'
  });

  // Keep section navigation from polluting the URL with hashes while retaining
  // the anchor href as a no-JavaScript fallback.
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
}
