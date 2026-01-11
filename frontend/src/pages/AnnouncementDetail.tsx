import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { announcementsAPI, Announcement } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Download, File } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedContent";

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  const announcementId = id ? Number(id) : NaN;

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (Number.isNaN(announcementId)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await announcementsAPI.getById(announcementId);
        setAnnouncement(data);
      } catch (error) {
        console.error("Failed to load announcement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [announcementId]);

  const getTitleField = () => {
    if (!announcement) return undefined;
    return {
      EN: announcement.titleEN,
      RW: announcement.titleRW,
      FR: announcement.titleFR,
    };
  };

  const getDescriptionField = () => {
    if (!announcement) return undefined;
    return {
      EN: announcement.descriptionEN,
      RW: announcement.descriptionRW,
      FR: announcement.descriptionFR,
    };
  };

  const getFallbackTitle = () => {
    if (!announcement) return "";
    return announcement.titleEN || announcement.titleRW || announcement.titleFR || "";
  };

  const getFallbackDescription = () => {
    if (!announcement) return "";
    return announcement.descriptionEN || announcement.descriptionRW || announcement.descriptionFR || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Loading announcement...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Announcement Not Found</h1>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
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
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <article className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <TranslatedText
                  field={getTitleField()}
                  language={language}
                  fallback={getFallbackTitle()}
                />
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {announcement.image && (
              <div className="mb-8">
                <img
                  src={announcement.image}
                  alt={getFallbackTitle()}
                  className="w-full h-[400px] object-cover rounded-lg"
                />
              </div>
            )}

            {announcement.video && (
              <div className="mb-8">
                <video
                  controls
                  className="w-full rounded-lg"
                  poster={announcement.image}
                >
                  <source src={announcement.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {announcement.file && (
              <div className="mb-8">
                <div className="border rounded-lg p-4 bg-muted">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{announcement.fileName || "Attached File"}</h3>
                        {announcement.fileType && (
                          <p className="text-sm text-muted-foreground">{announcement.fileType}</p>
                        )}
                      </div>
                    </div>
                    <a
                      href={announcement.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                  
                  {/* Embed PDF or images inline */}
                  {announcement.fileType?.includes('pdf') || announcement.file?.toLowerCase().endsWith('.pdf') ? (
                    <div className="mt-4 border rounded overflow-hidden">
                      <iframe
                        src={announcement.file}
                        className="w-full h-[600px]"
                        title={announcement.fileName || "PDF Viewer"}
                      />
                    </div>
                  ) : announcement.fileType?.startsWith('image/') || 
                      ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => 
                        announcement.file?.toLowerCase().endsWith(`.${ext}`)
                      ) ? (
                    <div className="mt-4">
                      <img
                        src={announcement.file}
                        alt={announcement.fileName || "Attached image"}
                        className="w-full max-h-[600px] object-contain rounded"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-lg">
                <TranslatedText
                  field={getDescriptionField()}
                  language={language}
                  fallback={getFallbackDescription()}
                />
              </div>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnnouncementDetail;

