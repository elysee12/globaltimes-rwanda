import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNews } from "@/contexts/NewsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedArticleFieldsAsync, getLocalizedArticleFields, getTranslatedCategory } from "@/lib/localization";
import { normalizeImageUrl, normalizeImageUrls, normalizeHtmlImageUrls, addImageCaptions, convertTextToParagraphs } from "@/lib/image-utils";
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
        console.log('NewsDetail: Article imageCaptions:', article.imageCaptions);
        console.log('NewsDetail: Content before processing:', translated.content.substring(0, 200));
        // Convert plain text to paragraphs if needed
        let processedContent = convertTextToParagraphs(translated.content);
        // Normalize image URLs in the content HTML
        let normalizedContent = normalizeHtmlImageUrls(processedContent);
        console.log('NewsDetail: Content after normalizeHtmlImageUrls:', normalizedContent.substring(0, 200));
        // Add captions to images
        normalizedContent = addImageCaptions(normalizedContent, article.imageCaptions, language);
        console.log('NewsDetail: Content after addImageCaptions:', normalizedContent.substring(0, 300));
        setLocalizedArticle({
          ...translated,
          content: normalizedContent,
        });
      } catch (error) {
        console.warn('Translation failed:', error);
        // Fallback to sync version if translation fails
        const sync = getLocalizedArticleFields(article, language);
        console.log('NewsDetail: Fallback - Article imageCaptions:', article.imageCaptions);
        // Convert plain text to paragraphs if needed
        let processedContent = convertTextToParagraphs(sync.content);
        // Normalize image URLs in the content HTML
        let normalizedContent = normalizeHtmlImageUrls(processedContent);
        // Add captions to images
        normalizedContent = addImageCaptions(normalizedContent, article.imageCaptions, language);
        setLocalizedArticle({
          ...sync,
          content: normalizedContent,
        });
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

            {/* Featured Image with Excerpt and Content Layout */}
            {((article.image || (article.images && article.images.length > 0)) && localizedArticle.excerpt) ? (
              <div className="mb-8">
                {/* Container for image and text flow */}
                <div className="relative">
                  {/* Featured Image - Floated Left on desktop */}
                  <div className="w-full md:w-1/2 md:float-left md:mr-6 mb-6 md:mb-0">
                    {article.image ? (
                      <img
                        src={normalizeImageUrl(article.image)}
                        alt={localizedArticle.title}
                        className="w-full h-auto max-h-[600px] object-contain rounded-lg"
                      />
                    ) : article.images && article.images.length > 0 ? (
                      <img
                        src={normalizeImageUrl(article.images[0])}
                        alt={localizedArticle.title}
                        className="w-full h-auto max-h-[600px] object-contain rounded-lg"
                      />
                    ) : null}
                  </div>
                  
                  {/* Excerpt with justified text - flows around image */}
                  <p className="text-xl md:text-2xl font-bold text-foreground leading-relaxed text-justify mb-6">
                    {localizedArticle.excerpt}
                  </p>
                  
                  {/* Content wrapper - flows around image on right side */}
                  <div className="prose prose-lg max-w-none">
                    <div 
                      className="prose max-w-none 
                        font-serif 
                        text-2xl leading-relaxed
                        text-justify
                        [&_p]:mb-6 [&_p]:text-foreground [&_p]:text-justify [&_p]:text-2xl
                        [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-center
                        [&_h2]:mb-4 [&_h2]:mt-6 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-center
                        [&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-center
                        [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:text-left [&_ul]:text-2xl
                        [&_ol]:mb-6 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:text-left [&_ol]:text-2xl
                        [&_li]:mb-2 [&_li]:text-2xl
                        [&_blockquote]:mb-6 [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:italic [&_blockquote]:text-left [&_blockquote]:text-2xl
                        [&_img]:w-full [&_img]:max-w-full [&_img]:h-auto [&_img]:my-6 [&_img]:rounded [&_img]:object-contain
                        [&_figure]:my-6 [&_figure]:block
                        [&_.image-caption]:text-sm [&_.image-caption]:text-muted-foreground [&_.image-caption]:mt-2 [&_.image-caption]:text-center [&_.image-caption]:italic"
                      dangerouslySetInnerHTML={{ __html: localizedArticle.content }} 
                    />
                  </div>
                  
                  {/* Clear float to allow content to continue full-width after image ends */}
                  <div className="clear-both"></div>
                </div>
              </div>
            ) : (
              <>
                {/* Fallback: Show image or images if no excerpt */}
                {(article.images && article.images.length > 0) ? (
                  <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {normalizeImageUrls(article.images).map((url, idx) => (
                      <img key={idx} src={url} alt={localizedArticle.title} className="w-full max-h-[400px] object-cover rounded-lg" />
                    ))}
                  </div>
                ) : (
                  article.image && (
                    <div className="mb-8">
                      <img
                        src={normalizeImageUrl(article.image)}
                        alt={localizedArticle.title}
                        className="w-full max-h-[600px] object-contain rounded-lg"
                      />
                    </div>
                  )
                )}
                {/* Show excerpt separately if no image */}
                {localizedArticle.excerpt && (
                  <div className="mb-8">
                    <p className="text-xl md:text-2xl font-bold text-foreground leading-relaxed text-justify">
                      {localizedArticle.excerpt}
                    </p>
                  </div>
                )}
                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="prose max-w-none 
                      font-serif 
                      text-2xl leading-relaxed
                      text-justify
                      [&_p]:mb-6 [&_p]:text-foreground [&_p]:text-justify [&_p]:text-2xl
                      [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-center
                      [&_h2]:mb-4 [&_h2]:mt-6 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-center
                      [&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-center
                      [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:text-left [&_ul]:text-2xl
                      [&_ol]:mb-6 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:text-left [&_ol]:text-2xl
                      [&_li]:mb-2 [&_li]:text-2xl
                      [&_blockquote]:mb-6 [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:italic [&_blockquote]:text-left [&_blockquote]:text-2xl
                      [&_img]:w-full [&_img]:max-w-full [&_img]:h-auto [&_img]:my-6 [&_img]:rounded [&_img]:object-contain
                      [&_figure]:my-6 [&_figure]:block
                      [&_.image-caption]:text-sm [&_.image-caption]:text-muted-foreground [&_.image-caption]:mt-2 [&_.image-caption]:text-center [&_.image-caption]:italic"
                    dangerouslySetInnerHTML={{ __html: localizedArticle.content }} 
                  />
                </div>
              </>
            )}

            {article.video && (
              <div className="mb-8">
                <video
                  controls
                  className="w-full rounded-lg"
                  poster={normalizeImageUrl(article.image)}
                >
                  <source src={normalizeImageUrl(article.video)} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsDetail;
