import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  tags?: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  isAiGenerated?: boolean;
}

// Row shape of the news_articles table
interface NewsArticleRow {
  id: string;
  title: string;
  summary: string | null;
  body: string;
  category: string | null;
  ai_generated: boolean | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToArticle(row: NewsArticleRow): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    content: row.body,
    excerpt: row.summary || undefined,
    author: (row.ai_generated ?? false) ? 'AI Newsroom' : 'PoliceBrutalityTracker',
    status: 'published',
    category: row.category || 'News',
    tags: (row.ai_generated ?? false) ? ['ai-generated'] : [],
    published_at: row.published_at || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    isAiGenerated: row.ai_generated ?? false,
  };
}

// Get news article by id
export function useNewsArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ['newsArticle', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('Article not found');

      return mapRowToArticle(data as NewsArticleRow);
    },
    enabled: !!slug,
  });
}

// Get all published news articles
export function useAllPublishedNews() {
  return useQuery({
    queryKey: ['allPublishedNews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return ((data as NewsArticleRow[]) || []).map(mapRowToArticle);
    },
    staleTime: 0, // Always refetch to get latest articles
  });
}
