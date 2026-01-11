import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNews } from "@/contexts/NewsContext";
import { Link } from "react-router-dom";
import { TranslatedText } from "@/components/TranslatedContent";

const TrendingNews = () => {
  const { t, language } = useLanguage();
  const { getTrendingArticles, loading } = useNews();
  const articles = getTrendingArticles();
  const hasTrending = !loading && articles.length > 0;
  const fallbackEntries = [
    { id: "placeholder", text: t("trending.news1"), link: undefined },
    { id: "placeholder2", text: t("trending.news2"), link: undefined },
    { id: "placeholder3", text: t("trending.news3"), link: undefined },
        ];

  return (
    <div className="bg-navy text-white py-3 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gold font-bold whitespace-nowrap">
            <TrendingUp className="h-5 w-5" />
            <span>{t("home.trendingNow")}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              {hasTrending
                ? articles.map((article) => {
                    const fallback =
                      article.title.EN ||
                      article.title.RW ||
                      article.title.FR ||
                      t("home.trendingNow");
                    return (
                      <Link
                        key={article.id}
                        to={`/news/${article.id}`}
                        className="inline-block mx-8 hover:text-gold transition-colors"
                      >
                        •{" "}
                        <TranslatedText
                          field={article.title}
                          language={language}
                          fallback={fallback}
                        />
                      </Link>
                    );
                  })
                : fallbackEntries.map((entry) =>
                entry.link ? (
                      <Link
                    key={entry.id}
                        to={entry.link}
                    className="inline-block mx-8 hover:text-gold transition-colors"
                  >
                    • {entry.text}
                      </Link>
                ) : (
                  <span key={entry.id} className="inline-block mx-8">
                    • {entry.text}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingNews;
