import { useMemo, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNews } from "@/contexts/NewsContext";
import { getLocalizedArticleFieldsAsync } from "@/lib/localization";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";

const Technology = () => {
  const { t, language } = useLanguage();
  const { articles, loading } = useNews();
  const [translatedData, setTranslatedData] = useState<Map<string, { title: string; excerpt: string }>>(new Map());

  const technologyArticles = useMemo(() => {
    return articles.filter(a => a.category.toLowerCase() === 'technology');
  }, [articles]);

  useEffect(() => {
    const translateArticles = async () => {
      const translations = new Map();
      for (const article of technologyArticles) {
        try {
          const translated = await getLocalizedArticleFieldsAsync(article, language);
          translations.set(article.id, { title: translated.title, excerpt: translated.excerpt });
        } catch (error) {
          console.warn(`Translation failed for article ${article.id}:`, error);
        }
      }
      setTranslatedData(translations);
    };

    if (technologyArticles.length > 0) {
      translateArticles();
    }
  }, [technologyArticles, language]);

  const technologyNews = useMemo(() => {
    return technologyArticles.map(article => {
      const translated = translatedData.get(article.id);
      return {
        id: article.id,
        title: translated?.title || '',
        excerpt: translated?.excerpt || '',
        category: article.category,
        image: article.image,
        date: article.date,
        featured: article.featured,
        trending: article.trending,
      };
    });
  }, [technologyArticles, translatedData]);

  const topStories = useMemo(() => {
    return technologyNews.filter(news => news.featured || news.trending).slice(0, 3);
  }, [technologyNews]);

  const latestNews = useMemo(() => {
    return technologyNews.filter(news => !news.featured && !news.trending);
  }, [technologyNews]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-8 animate-fade-in">
            {t('nav.technology')}
          </h1>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : (
            <>
              {topStories.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold text-navy mb-6 border-l-4 border-gold pl-4">
                    {t('home.featuredNews')}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topStories.map((news) => (
                      <NewsCard key={news.id} {...news} featured />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-3xl font-bold text-navy mb-6 border-l-4 border-gold pl-4">
                  {t('home.latestNews')}
                </h2>
                {latestNews.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestNews.map((news) => (
                      <NewsCard key={news.id} {...news} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No latest articles yet. Add some from the admin panel!
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Technology;
