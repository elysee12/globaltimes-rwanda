import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const Contact = () => {
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Open WhatsApp chat with pre-filled message for the user to send
      const whatsappText = encodeURIComponent(
        `New contact from Global Times Rwanda:\n\nName: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`
      );
      window.open(
        `https://wa.me/250784625552?text=${whatsappText}`,
        "_blank",
        "noopener,noreferrer"
      );

      toast.success("Your message has been sent successfully.");
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Unable to send your message right now. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-navy mb-4">{t('contact.title')}</h1>
            <p className="text-muted-foreground text-lg">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Form */}
            <div className="bg-card p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-navy mb-6">{t('contact.send')}</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('contact.name')}</label>
                  <Input
                    placeholder={t('contact.name')}
                    value={form.name}
                    onChange={handleChange("name")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('contact.email')}</label>
                  <Input
                    type="email"
                    placeholder={t('contact.email')}
                    value={form.email}
                    onChange={handleChange("email")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('contact.subject')}</label>
                  <Input
                    placeholder={t('contact.subject')}
                    value={form.subject}
                    onChange={handleChange("subject")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('contact.message')}</label>
                  <Textarea
                    placeholder={t('contact.message')}
                    rows={5}
                    value={form.message}
                    onChange={handleChange("message")}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-navy hover:bg-navy/90 text-white"
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : t('contact.send')}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-navy text-white p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-gold mb-6">{t('contact.info')}</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{t('contact.address')}</h3>
                      <p className="text-white/80">{t('contact.addressValue')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{t('contact.phone')}</h3>
                      <p className="text-white/80">{t('contact.phoneValue')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{t('contact.emailLabel')}</h3>
                      <p className="text-white/80">{t('contact.emailValue')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gold/10 border-2 border-gold p-6 rounded-lg">
                <h3 className="font-bold text-navy text-lg mb-2">{t('contact.pressInquiries')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('contact.pressDesc')}
                </p>
                <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
                  {t('contact.pressContact')}
                </Button>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
            <p className="text-muted-foreground">{t('contact.mapLocation')}</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
