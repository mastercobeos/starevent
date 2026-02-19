export function createPageUrl(page) {
  if (page === 'Home') return '/';
  return `/${page.toLowerCase()}`;
}
