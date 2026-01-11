import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNews } from "@/contexts/NewsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedArticleFieldsAsync, getLocalizedArticleFields, getTranslatedCategory } from "@/lib/localization";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getArticleById } = useNews();
  const { language, t } = useLanguage();
  const [localizedArticle, setLocalizedArticle] = useState<{ title: string; excerpt: string; content: string } | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  const articleId = id ? Number(id) : NaN;
  const article = Number.isNaN(articleId) ? undefined : getArticleById(articleId);

  useEffect(() => {
    const loadTranslation = async () => {
      if (!article) {
        setLocalizedArticle(null);
        return;
      }

      setLoadingTranslation(true);
      try {
        const translated = await getLocalizedArticleFieldsAsync(article, language);
        setLocalizedArticle(translated);
      } catch (error) {
        console.warn('Translation failed:', error);
        // Fallback to sync version if translation fails
        const sync = getLocalizedArticleFields(article, language);
        setLocalizedArticle(sync);
      } finally {
        setLoadingTranslation(false);
      }
    };

    loadTranslation();
  }, [article, language]);

  if (!article || !localizedArticle) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{t('newsDetail.notFound')}</h1>
            <Button onClick={() => navigate("/")}>{t('newsDetail.backHome')}</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('newsDetail.back')}
          </Button>

          <article className="max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-block px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded mb-4">
                {getTranslatedCategory(article.category, t)}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{localizedArticle.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <img
                src={article.image}
                alt={localizedArticle.title}
                className="w-full max-h-[600px] object-contain rounded-lg"
              />
            </div>

            {article.video && (
              <div className="mb-8">
                <video
                  controls
                  className="w-full rounded-lg"
                  poster={article.image}
                >
                  <source src={article.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground mb-6">{localizedArticle.excerpt}</p>
              <div className="whitespace-pre-wrap">{localizedArticle.content}</div>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsDetail;
