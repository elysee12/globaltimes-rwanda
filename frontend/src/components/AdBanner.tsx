import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { advertisementsAPI, Advertisement } from "@/lib/api";

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
};

interface AdBannerProps {
  size?: "large" | "medium" | "small";
  position?: string;
}

const AdBanner = ({ size = "large", position = "banner" }: AdBannerProps) => {
  const { t } = useLanguage();
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const ads = await advertisementsAPI.getByPlacement(position);
        if (ads.length > 0) {
          const randomAd = ads[Math.floor(Math.random() * ads.length)];
          setAd(randomAd);
        } else {
          setAd(null);
        }
      } catch (error) {
        console.error("Error fetching ad:", error);
        setAd(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [position]);

  const minHeights = {
    large: "min-h-[220px]",
    medium: "min-h-[160px]",
    small: "min-h-[120px]",
  };

  const handleAdClick = () => {
    if (ad?.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div
        className={`${minHeights[size]} bg-gradient-to-r from-gold/20 to-navy/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted animate-fade-in`}
      >
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Loading ad...</p>
        </div>
      </div>
    );
  }

  if (ad) {
    const hasMedia = Boolean(ad.mediaUrl?.trim());
    const isVideo = isVideoUrl(ad.mediaUrl);

    return (
      <button
        type="button"
        onClick={handleAdClick}
        disabled={!ad.linkUrl}
        className={`${minHeights[size]} rounded-lg overflow-hidden animate-fade-in border border-border bg-card w-full`}
        aria-label={ad.title}
      >
        <div className="w-full bg-black/5 flex items-center justify-center">
          {hasMedia ? (
            isVideo ? (
              <video
                src={ad.mediaUrl}
                className="w-full h-auto object-contain block"
                autoPlay
                loop
                muted
                playsInline
                controls={false}
              />
            ) : (
              <img
                src={ad.mediaUrl}
                alt={ad.title}
                className="w-full h-auto object-contain block"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-8 w-full">
              <p className="text-muted-foreground font-semibold">{t("ad.space")}</p>
              <p className="text-xs text-muted-foreground">{t("ad.yourAd")}</p>
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <div
      className={`${minHeights[size]} bg-gradient-to-r from-gold/20 to-navy/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted animate-fade-in`}
    >
      <div className="text-center">
        <p className="text-muted-foreground font-semibold">{t("ad.space")}</p>
        <p className="text-xs text-muted-foreground">{t("ad.yourAd")}</p>
      </div>
    </div>
  );
};

export default AdBanner;
