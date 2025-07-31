function normalize(url) {
  try {
    const u = new URL(url.toLowerCase());
    u.protocol = 'https:';
    const pathname = u.pathname.endsWith('/') ? u.pathname : u.pathname + '/';
    return `${u.origin}${pathname}`;
  } catch {
    return url.toLowerCase();
  }
}

export const SOCIAL_LINKS = {
  instagram: normalize('https://www.instagram.com/hybriddancers/'),
  tiktok: normalize('https://www.tiktok.com/@hybrid.dancers'),
  facebook: normalize('https://www.facebook.com/people/hybrid-dancers/61577357196451/')
};
