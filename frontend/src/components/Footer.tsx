import { Link } from "react-router-dom";
import { Facebook, Twitter, Youtube, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-navy text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-gold text-xl font-bold mb-4">Global Times Rwanda</h3>
            <p className="text-sm text-white/80 mb-4">
              {t('footer.aboutText')}
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-gold transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/@elyseetuyisenge4686" className="hover:text-gold transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="//www.instagram.com/elyse12_" className="hover:text-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold font-bold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-gold transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/politics" className="hover:text-gold transition-colors">{t('nav.politics')}</Link></li>
              <li><Link to="/business" className="hover:text-gold transition-colors">{t('nav.business')}</Link></li>
              <li><Link to="/sports" className="hover:text-gold transition-colors">{t('nav.sports')}</Link></li>
              <li><Link to="/economics" className="hover:text-gold transition-colors">{t('nav.economics')}</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-gold font-bold mb-4">{t('footer.categories')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/technology" className="hover:text-gold transition-colors">{t('nav.technology')}</Link></li>
              <li><Link to="/entertainment" className="hover:text-gold transition-colors">{t('nav.entertainment')}</Link></li>
              <li><Link to="/education" className="hover:text-gold transition-colors">{t('nav.education')}</Link></li>
              <li><Link to="/others" className="hover:text-gold transition-colors">{t('nav.others')}</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold font-bold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>KN 4 Ave, Kigali, Rwanda</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+250 784 625 552</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>robertbjournal@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 text-center text-sm text-white/80">
          <p>&copy; 2025 Global Times Rwanda. {t('footer.rights')} | <Link to="/contact" className="hover:text-gold transition-colors">Privacy Policy</Link> | <Link to="/contact" className="hover:text-gold transition-colors">Terms of Service</Link></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
