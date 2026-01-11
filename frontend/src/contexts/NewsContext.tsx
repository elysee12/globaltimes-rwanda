import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { newsAPI, NewsArticle as APINewsArticle } from '@/lib/api';

// Frontend-friendly format with nested language objects
export interface NewsArticle {
  id: number;
  title: {
    EN: string;
    RW: string;
    FR: string;
  };
  excerpt: {
    EN: string;
    RW: string;
    FR: string;
  };
  content: {
    EN: string;
    RW: string;
    FR: string;
  };
  category: string;
  image?: string;
  video?: string;
  date: string;
  author: string;
  featured?: boolean;
  trending?: boolean;
}

// Helper to convert API format to frontend format
const apiToFrontend = (apiArticle: APINewsArticle): NewsArticle => ({
  id: apiArticle.id,
  title: {
    EN: apiArticle.titleEN,
    RW: apiArticle.titleRW,
    FR: apiArticle.titleFR,
  },
  excerpt: {
    EN: apiArticle.excerptEN,
    RW: apiArticle.excerptRW,
    FR: apiArticle.excerptFR,
  },
  content: {
    EN: apiArticle.contentEN,
    RW: apiArticle.contentRW,
    FR: apiArticle.contentFR,
  },
  category: apiArticle.category,
  image: apiArticle.image || undefined,
  video: apiArticle.video || undefined,
  date: apiArticle.createdAt,
  author: apiArticle.author,
  featured: apiArticle.featured,
  trending: apiArticle.trending,
});

// Helper to convert frontend format to API format
const frontendToAPI = (article: NewsArticle): Omit<APINewsArticle, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'publishedAt'> => ({
  titleEN: article.title.EN,
  titleRW: article.title.RW,
  titleFR: article.title.FR,
  excerptEN: article.excerpt.EN,
  excerptRW: article.excerpt.RW,
  excerptFR: article.excerpt.FR,
  contentEN: article.content.EN,
  contentRW: article.content.RW,
  contentFR: article.content.FR,
  category: article.category,
  image: article.image,
  video: article.video,
  author: article.author,
  featured: article.featured ?? false,
  trending: article.trending ?? false,
});

interface NewsContextType {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  addArticle: (article: NewsArticle) => Promise<void>;
  updateArticle: (id: number, article: NewsArticle) => Promise<void>;
  deleteArticle: (id: number) => Promise<void>;
  getArticleById: (id: number) => NewsArticle | undefined;
  getArticlesByCategory: (category: string) => NewsArticle[];
  getFeaturedArticles: () => NewsArticle[];
  getTrendingArticles: () => NewsArticle[];
  refreshArticles: () => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await newsAPI.getAll({ limit: 1000 });
      const convertedArticles = response.data.map(apiToFrontend);
      setArticles(convertedArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const addArticle = async (article: NewsArticle) => {
    try {
      const apiArticle = frontendToAPI(article);
      const created = await newsAPI.create(apiArticle);
      const converted = apiToFrontend(created);
      setArticles(prev => [converted, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add article');
      throw err;
    }
  };

  const updateArticle = async (id: number, article: NewsArticle) => {
    try {
      const apiArticle = frontendToAPI(article);
      const updated = await newsAPI.update(id, apiArticle as Partial<APINewsArticle>);
      const converted = apiToFrontend(updated);
      setArticles(prev => prev.map(a => a.id === id ? converted : a));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update article');
      throw err;
    }
  };

  const deleteArticle = async (id: number) => {
    try {
      await newsAPI.delete(id);
    setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
      throw err;
    }
  };

  const getArticleById = (id: number) => {
    return articles.find(a => a.id === id);
  };

  const getArticlesByCategory = (category: string) => {
    return articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
  };

  const getFeaturedArticles = () => {
    return articles.filter(a => a.featured);
  };

  const getTrendingArticles = () => {
    return articles.filter(a => a.trending);
  };

  return (
    <NewsContext.Provider value={{
      articles,
      loading,
      error,
      addArticle,
      updateArticle,
      deleteArticle,
      getArticleById,
      getArticlesByCategory,
      getFeaturedArticles,
      getTrendingArticles,
      refreshArticles: fetchArticles,
    }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
