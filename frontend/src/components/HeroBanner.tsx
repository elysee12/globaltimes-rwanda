import { useEffect, useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNews } from "@/contexts/NewsContext";
import { getTranslatedCategory, getLocalizedArticleFieldsAsync } from "@/lib/localization";
import { normalizeImageUrl } from "@/lib/image-utils";

const HeroBanner = () => {
  const { language, t } = useLanguage();
  const { articles } = useNews();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [translatedHeroNews, setTranslatedHeroNews] = useState<Map<string, { title: string }>>(new Map());

  const heroNews = useMemo(() => {
    // Use featured first; if none, fall back to latest
    const featured = articles.filter((a) => a.featured);
    const source = featured.length ? featured : articles;
    return source.slice(0, 7); // 1-2 for left, rest for right
  }, [articles]);

  // Translate hero news articles
  useEffect(() => {
    const translateArticles = async () => {
      const translations = new Map();
      for (const article of heroNews) {
        try {
          const translated = await getLocalizedArticleFieldsAsync(article, language);
          translations.set(String(article.id), { title: translated.title });
        } catch (error) {
          console.warn(`Failed to translate hero article ${article.id}:`, error);
        }
      }
      setTranslatedHeroNews(translations);
    };

    if (heroNews.length > 0) {
      translateArticles();
    }
  }, [heroNews, language]);

  useEffect(() => {
    if (heroNews.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroNews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroNews.length]);

  useEffect(() => {
    if (currentSlide >= heroNews.length) {
      setCurrentSlide(0);
    }
  }, [heroNews.length, currentSlide]);

  if (heroNews.length === 0) {
    return (
      <div className="bg-gradient-to-r from-navy to-navy/90 text-white py-24">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold">{t('home.noArticles') || "No featured articles yet"}</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {t('home.addArticlesPrompt') || "Use the admin panel to publish your first featured story and it will appear here automatically."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: single large main featured card (auto-rotates) */}
          {(() => {
            const featuredIndex = heroNews.length ? currentSlide % heroNews.length : 0;
            const featured = heroNews[featuredIndex];
            if (!featured) return null;
            return (
              <Link
                to={`/news/${featured.id}`}
                className="relative w-full overflow-hidden rounded-lg bg-black lg:col-span-2"
                style={{ height: 420 }}
              >
                <img
                  src={normalizeImageUrl(featured.image)}
                  alt={translatedHeroNews.get(String(featured.id))?.title || ''}
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 pointer-events-none rounded-lg ring-1 ring-white/10" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                  <span className="inline-block px-3 py-1 bg-gold text-white text-xs font-semibold rounded">
                    {getTranslatedCategory(featured.category, t)}
                  </span>
                  <h2 className="mt-3 text-white text-2xl md:text-4xl font-bold leading-tight">
                    {translatedHeroNews.get(String(featured.id))?.title || ''}
                  </h2>
                  <div className="mt-3 inline-flex items-center gap-2 text-white">
                    <span className="text-sm font-medium">{t('hero.readMore')}</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })()}

          {/* Right: list of smaller items */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {(() => {
              const featuredIndex = heroNews.length ? currentSlide % heroNews.length : -1;
              const others = heroNews.filter((_, i) => i !== featuredIndex).slice(0, 4);
              return others.map((item) => (
                <Link
                  to={`/news/${item.id}`}
                  key={`right-${item.id}`}
                  className="flex gap-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors p-2"
                >
                  <div className="relative w-32 h-24 shrink-0 overflow-hidden rounded">
                    <img
                      src={normalizeImageUrl(item.image)}
                      alt={translatedHeroNews.get(String(item.id))?.title || ''}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wide text-gold font-semibold">
                      {getTranslatedCategory(item.category, t)}
                    </span>
                    <h3 className="mt-1 text-white text-sm md:text-base font-semibold leading-snug line-clamp-3">
                      {translatedHeroNews.get(String(item.id))?.title || ''}
                    </h3>
                  </div>
                </Link>
              ));
            })()}
          </div>
        </div>

        {/* Slide indicators for featured switch */}
        <div className="mt-3 flex justify-center gap-2 lg:justify-start">
          {heroNews.map((_, i) => (
            <button
              key={`ind-${i}`}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 w-10 rounded ${i === currentSlide ? 'bg-gold' : 'bg-white/40'}`}
              aria-label={`Show featured ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
