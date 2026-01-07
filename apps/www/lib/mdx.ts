import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Locale } from './i18n/config';

const docsDirectory = path.join(process.cwd(), 'content/docs');

export interface DocMeta {
  title: string;
  description?: string;
  order?: number;
  slug: string;
}

export interface DocContent {
  meta: DocMeta;
  content: string;
}

export function getDocSlugs(locale: Locale): string[] {
  const localeDir = path.join(docsDirectory, locale);
  if (!fs.existsSync(localeDir)) return [];

  return fs
    .readdirSync(localeDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''));
}

export function getDocBySlug(slug: string, locale: Locale): DocContent | null {
  try {
    const fullPath = path.join(docsDirectory, locale, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      meta: {
        title: data.title || slug,
        description: data.description,
        order: data.order || 999,
        slug,
      },
      content,
    };
  } catch {
    return null;
  }
}

export function getAllDocs(locale: Locale): DocContent[] {
  const slugs = getDocSlugs(locale);
  return slugs
    .map((slug) => getDocBySlug(slug, locale))
    .filter((doc): doc is DocContent => doc !== null)
    .sort((a, b) => (a.meta.order || 999) - (b.meta.order || 999));
}
