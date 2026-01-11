import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Globe, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import HeaderAdCarousel from "./HeaderAdCarousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import englandFlag from "@/assets/england.jpg";
import rwandaFlag from "@/assets/rwanda.png";
import franceFlag from "@/assets/france.jpg";
import logo from "@/assets/Logo.jpg";
import whatsappIcon from "@/assets/watsapp.jpg";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const categories = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.politics"), path: "/politics" },
    { name: t("nav.business"), path: "/business" },
    { name: t("nav.technology"), path: "/technology" },
    { name: t("nav.sports"), path: "/sports" },
    { name: t("nav.entertainment"), path: "/entertainment" },
    { name: t("nav.economics"), path: "/economics" },
    { name: t("nav.education"), path: "/education" },
    { name: t("nav.myStory"), path: "/my-story" },
    { name: t("nav.others"), path: "/others" },
    { name: "Videos", path: "https://www.youtube.com/@elyseetuyisenge4686", external: true },
    { name: t("nav.contact"), path: "/contact" },
  ];

  const languageOptions: Array<{
    code: "EN" | "RW" | "FR";
    label: string;
    flag: string;
  }> = [
    { code: "EN", label: "English", flag: englandFlag },
    { code: "RW", label: "Kinyarwanda", flag: rwandaFlag },
    { code: "FR", label: "Français", flag: franceFlag },
  ];

  const activeLanguage = languageOptions.find((option) => option.code === language) ?? languageOptions[0];

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Only show header ad on homepage
  const isHomePage = location.pathname === "/";

  return (
    <>
      {/* Top Advertisement Banner - Full width at very top - Only on homepage */}
      {isHomePage && (
        <div className="w-full bg-navy relative overflow-hidden">
          <div className="relative w-full">
            <HeaderAdCarousel position="header" />
          </div>
        </div>
      )}

    <header className="sticky top-0 z-50 bg-background shadow-md">
      {/* Top Bar */}
        <div className="bg-navy">
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4 py-3">
              {/* Logo and Site Name */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
                  <img
                    src={logo}
                    alt="Global Times Rwanda Logo"
                    className="h-8 sm:h-10 md:h-12 w-auto object-contain"
                  />
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white whitespace-nowrap">
                Global Times <span className="text-gold">Rwanda</span>
                  </span>
              </Link>
            </div>
            
              {/* Language Switcher and Search */}
              <div className="flex items-center gap-3 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-gold hover:bg-navy/50 gap-2"
                >
                  <Globe className="h-4 w-4" />
                    <img
                      src={activeLanguage.flag}
                      alt={`${activeLanguage.label} flag`}
                      className="h-4 w-6 object-cover rounded-sm"
                    />
                    <span className="font-semibold">{activeLanguage.code}</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {languageOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.code}
                      onClick={() => setLanguage(option.code)}
                      className="flex items-center gap-2"
                    >
                      <img
                        src={option.flag}
                        alt={`${option.label} flag`}
                        className="h-4 w-6 object-cover rounded-sm"
                      />
                      <span className="font-medium">{option.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <a
                href="https://wa.me/250784625552"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors p-2"
                aria-label="Chat on WhatsApp"
              >
                <img src={whatsappIcon} alt="WhatsApp" className="h-5 w-5 object-contain" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-news-red">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Desktop Menu */}
            <ul className="hidden md:flex items-center space-x-1">
              {categories.map((category) => {
                const active = isActivePath(category.path);
                if (category.external) {
                  return (
                    <li key={category.name}>
                      <a
                        href={category.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block px-4 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
                      >
                        {category.name}
                      </a>
                    </li>
                  );
                }
                return (
                <li key={category.path}>
                  <Link
                    to={category.path}
                      className={`relative block px-4 py-3 font-semibold transition-colors ${
                        active ? "bg-white/15 text-white" : "text-white hover:bg-white/10"
                      }`}
                  >
                    {category.name}
                      {active && (
                        <span className="absolute inset-x-2 bottom-1 h-0.5 bg-gold rounded-full" />
                      )}
                  </Link>
                </li>
                );
              })}
            </ul>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 animate-slide-up">
              <ul className="space-y-2">
                {categories.map((category) => {
                  const active = isActivePath(category.path);
                  if (category.external) {
                    return (
                      <li key={category.name}>
                        <a
                          href={category.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category.name}
                        </a>
                      </li>
                    );
                  }
                  return (
                  <li key={category.path}>
                    <Link
                      to={category.path}
                        className={`relative block px-4 py-2 transition-colors ${
                          active ? "bg-white/15 text-white" : "text-white hover:bg-white/10"
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                        {active && (
                          <span className="absolute inset-x-2 bottom-1 h-0.5 bg-gold rounded-full" />
                        )}
                    </Link>
                  </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </nav>
    </header>
    </>
  );
};

export default Navbar;
