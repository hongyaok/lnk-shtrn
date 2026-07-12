/**
 * Micro-Landing Page Array Packer
 * 
 * Packs a structured object into a flat array delimited by a Unit Separator (\x1F).
 * Structure: Name, Bio, Title1, URL1, Title2, URL2, Title3, URL3, Title4, URL4, Title5, URL5
 */

export const MICRO_PAGE_DELIMITER = '\x1F';

export interface MicroPageData {
  name: string;
  bio: string;
  avatarUrl?: string;
  links: Array<{ title: string; url: string }>;
}

export function packMicroPage(data: MicroPageData): string {
  const parts: string[] = [];
  
  // Clean inputs to avoid delimiter injection
  const sanitize = (str: string) => str.replace(/\x1F/g, '');
  
  parts.push(sanitize(data.name));
  parts.push(sanitize(data.bio));
  
  for (let i = 0; i < 5; i++) {
    if (data.links[i] && (data.links[i].url || data.links[i].title)) {
      parts.push(sanitize(data.links[i].title));
      parts.push(sanitize(data.links[i].url));
    } else {
      parts.push('');
      parts.push('');
    }
  }
  
  // Trailing empty pairs can be trimmed to save space
  while (parts.length > 2 && parts[parts.length - 1] === '' && parts[parts.length - 2] === '') {
    parts.pop();
    parts.pop();
  }
  
  if (data.avatarUrl) {
    parts.push(sanitize(data.avatarUrl));
  }
  
  return parts.join(MICRO_PAGE_DELIMITER);
}

export function unpackMicroPage(packed: string): MicroPageData | null {
  const parts = packed.split(MICRO_PAGE_DELIMITER);
  if (parts.length < 2) return null;
  
  const name = parts[0];
  const bio = parts[1];
  const links: Array<{ title: string; url: string }> = [];
  
  let avatarUrl: string | undefined;
  let linksEnd = parts.length;
  
  if (parts.length % 2 !== 0) {
    avatarUrl = parts[parts.length - 1];
    linksEnd = parts.length - 1;
  }
  
  for (let i = 2; i < linksEnd; i += 2) {
    const title = parts[i] || '';
    const url = parts[i + 1] || '';
    if (title || url) {
      links.push({ title, url });
    }
  }
  
  return { name, bio, avatarUrl, links };
}
