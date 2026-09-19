import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  isAiGenerated?: boolean;
}

// Row shape from database
interface NewsArticleRow {
  id: string;
  title: string;
  summary: string | null;
  body: string;
  category: string | null;
  ai_generated: boolean | null;
  published: boolean | null;
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
    status: row.published ? 'published' : 'draft',
    category: row.category || 'News',
    tags: (row.ai_generated ?? false) ? ['ai-generated'] : [],
    published_at: row.published_at || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    isAiGenerated: row.ai_generated ?? false,
  };
}

// Get all news articles (admin)
export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data as NewsArticleRow[]) || []).map(mapRowToArticle);
    }
  });
}

// Get published news articles (public)
export function usePublishedNews() {
  return useQuery({
    queryKey: ['publishedNews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data as NewsArticleRow[]) || []).map(mapRowToArticle);
    }
  });
}

// Get recent published news (for homepage)
export function useRecentNews(limit: number = 3) {
  return useQuery({
    queryKey: ['recentNews', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return ((data as NewsArticleRow[]) || []).map(mapRowToArticle);
    }
  });
}

// Create news article
export function useCreateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsData: any) => {
      const { data, error } = await supabase
        .from('news_articles')
        .insert({
          title: newsData.title,
          body: newsData.content,
          summary: newsData.excerpt,
          category: newsData.category,
          published: newsData.status === 'published',
          published_at: newsData.status === 'published' ? new Date().toISOString() : null,
          ai_generated: false,
        })
        .select()
        .single();

      if (error) throw error;
      return mapRowToArticle(data as NewsArticleRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['publishedNews'] });
      queryClient.invalidateQueries({ queryKey: ['recentNews'] });
    }
  });
}

// Update news article
export function useUpdateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsData: any) => {
      const { id, ...updateData } = newsData;

      const dbUpdate: any = {
        updated_at: new Date().toISOString(),
      };

      if (updateData.title !== undefined) dbUpdate.title = updateData.title;
      if (updateData.content !== undefined) dbUpdate.body = updateData.content;
      if (updateData.excerpt !== undefined) dbUpdate.summary = updateData.excerpt;
      if (updateData.category !== undefined) dbUpdate.category = updateData.category;
      if (updateData.status !== undefined) {
        dbUpdate.published = updateData.status === 'published';
        if (updateData.status === 'published') {
          dbUpdate.published_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('news_articles')
        .update(dbUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapRowToArticle(data as NewsArticleRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['publishedNews'] });
      queryClient.invalidateQueries({ queryKey: ['recentNews'] });
    }
  });
}

// Delete news article
export function useDeleteNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['publishedNews'] });
      queryClient.invalidateQueries({ queryKey: ['recentNews'] });
    }
  });
}
