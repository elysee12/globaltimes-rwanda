import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { advertisementsAPI, Advertisement } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

const DEFAULT_PALETTE = [
  "from-gold/30 to-gold/10",
  "from-blue-500/30 to-blue-500/10",
  "from-green-500/30 to-green-500/10",
  "from-purple-500/30 to-purple-500/10",
];

type HeaderAdCarouselProps = {
  position?: string;
  gradientPalette?: string[];
  showArrows?: boolean;
  intervalMs?: number;
};

const HeaderAdCarousel = ({
  position = "header",
  gradientPalette = DEFAULT_PALETTE,
  showArrows = true,
  intervalMs = 5000,
}: HeaderAdCarouselProps) => {
  const { t } = useLanguage();
  const [currentAd, setCurrentAd] = useState(0);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const fetchedAds = await advertisementsAPI.getByPlacement(position);
        const activeAds = fetchedAds.filter((ad) => ad.isPublished === true);
        setAds(activeAds);
      } catch (error) {
        console.error(`Failed to load ${position} ads`, error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [position]);

  // Calculate how many pairs we can show
  const maxPairs = Math.ceil(ads.length / 2);
  
  useEffect(() => {
    if (ads.length < 2) return;
    const timer = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % maxPairs);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [ads.length, intervalMs, maxPairs]);

  const nextAd = () => {
    if (ads.length === 0) return;
    setCurrentAd((prev) => (prev + 1) % maxPairs);
  };
  const prevAd = () => {
    if (ads.length === 0) return;
    setCurrentAd((prev) => (prev - 1 + maxPairs) % maxPairs);
  };

  if (loading) {
    return (
      <div className="h-24 md:h-32 lg:h-36 xl:h-40 w-full flex items-center justify-center text-white/90 text-sm font-semibold py-2">
        Loading...
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="h-24 md:h-32 lg:h-36 xl:h-40 w-full flex items-center justify-center text-white/90 text-sm font-semibold py-2">
        {t("ad.space")} — {t("ad.yourAd")}
      </div>
    );
  }

  // Render a single ad
  const renderAd = (ad: Advertisement, index: number, showBorder: boolean = true) => {
    const adContent = ad.linkUrl ? (
      <a 
        href={ad.linkUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block w-full h-full"
      >
        {ad.mediaUrl ? (
          <img
            src={ad.mediaUrl}
            alt={ad.title}
            className="w-full h-24 md:h-32 lg:h-36 xl:h-40 object-cover"
          />
        ) : (
          <div
            className={`w-full h-24 md:h-32 lg:h-36 xl:h-40 bg-gradient-to-r ${gradientPalette[index % gradientPalette.length]} flex items-center justify-center`}
            aria-label={ad.title}
          >
            <span className="text-white font-semibold">{ad.title}</span>
          </div>
        )}
      </a>
    ) : (
      ad.mediaUrl ? (
        <img
          src={ad.mediaUrl}
          alt={ad.title}
          className="w-full h-24 md:h-32 lg:h-36 xl:h-40 object-cover"
        />
      ) : (
        <div
          className={`w-full h-24 md:h-32 lg:h-36 xl:h-40 bg-gradient-to-r ${gradientPalette[index % gradientPalette.length]} flex items-center justify-center`}
          aria-label={ad.title}
        >
          <span className="text-white font-semibold">{ad.title}</span>
        </div>
      )
    );

    return (
      <div key={`${ad.id}-${index}`} className={`min-w-[50%] flex items-center justify-center ${showBorder ? 'border-r border-white/10' : ''}`}>
        {adContent}
      </div>
    );
  };

  // Render placeholder for empty ad slot
  const renderPlaceholder = () => {
    return (
      <div className="min-w-[50%] flex items-center justify-center border-l border-white/10 h-24 md:h-32 lg:h-36 xl:h-40 bg-black/20">
        <span className="text-white/70 text-sm font-semibold">{t("ad.space")}</span>
      </div>
    );
  };

  // Create pairs of ads
  const adPairs: Advertisement[][] = [];
  for (let i = 0; i < ads.length; i += 2) {
    adPairs.push(ads.slice(i, i + 2));
  }

  return (
    <div className="relative overflow-hidden w-full">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentAd * 100}%)` }}
      >
        {adPairs.map((pair, pairIndex) => (
          <div key={pairIndex} className="min-w-full flex items-center justify-center">
            {pair.map((ad, adIndex) => renderAd(ad, pairIndex * 2 + adIndex, adIndex === 0))}
            {/* If odd number of ads in pair, show placeholder */}
            {pair.length === 1 && renderPlaceholder()}
          </div>
        ))}
      </div>
      {showArrows && maxPairs > 1 && (
        <>
          <button
            onClick={prevAd}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition-colors z-10"
            aria-label="Previous ad"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextAd}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition-colors z-10"
            aria-label="Next ad"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default HeaderAdCarousel;
