import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NewsProvider } from "./contexts/NewsContext";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Politics from "./pages/Politics";
import Business from "./pages/Business";
import Technology from "./pages/Technology";
import Sports from "./pages/Sports";
import Entertainment from "./pages/Entertainment";
import Economics from "./pages/Economics";
import Education from "./pages/Education";
import Others from "./pages/Others";
import MyStory from "./pages/MyStory";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ManageNews from "./pages/ManageNews";
import ManageMedia from "./pages/ManageMedia";
import ManageAds from "./pages/ManageAds";
import ManageAnnouncements from "./pages/ManageAnnouncements";
import NewsDetail from "./pages/NewsDetail";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SessionTimeoutWarning from "./components/SessionTimeoutWarning";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <NewsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
          <SessionTimeoutWarning />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/admin/news" element={<ProtectedRoute><ManageNews /></ProtectedRoute>} />
            <Route path="/admin/media" element={<ProtectedRoute><ManageMedia /></ProtectedRoute>} />
            <Route path="/admin/ads" element={<ProtectedRoute><ManageAds /></ProtectedRoute>} />
            <Route path="/admin/announcements" element={<ProtectedRoute><ManageAnnouncements /></ProtectedRoute>} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/announcements/:id" element={<AnnouncementDetail />} />
            <Route path="/politics" element={<Politics />} />
            <Route path="/business" element={<Business />} />
            <Route path="/technology" element={<Technology />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/entertainment" element={<Entertainment />} />
            <Route path="/economics" element={<Economics />} />
            <Route path="/education" element={<Education />} />
            <Route path="/my-story" element={<MyStory />} />
            <Route path="/others" element={<Others />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </NewsProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
