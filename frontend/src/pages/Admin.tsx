import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, BarChart3, Video, LogOut, Megaphone, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { statsAPI, StatsResponse, authAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Admin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await statsAPI.get();
        setStats(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const formatNumber = useMemo(() => {
    return (value?: number) => {
      if (value === undefined || value === null) return "0";
      if (value < 1000) return value.toString();
      return Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem("isAdminLoggedIn");
    toast.success(t('auth.logoutSuccess'));
    navigate("/auth");
  };

  const handlePasswordChange =
    (field: keyof typeof passwordForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const submitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      await Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "New password must be at least 6 characters long.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      await Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "New password and confirmation do not match.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      const result = await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: result.message || "Password updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setChangePasswordOpen(false);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update password. Please try again.";
      
      await Swal.fire({
        icon: "error",
        title: "Password Update Failed",
        text: errorMessage,
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const profileInitial = "A";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{t('admin.title')}</h1>
              <p className="text-muted-foreground">{t('admin.welcome')}</p>
            </div>
            <div>
              <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                <button
                  onClick={() => setProfileDialogOpen(true)}
                  className="h-11 w-11 rounded-full bg-navy text-white font-semibold text-lg flex items-center justify-center shadow hover:bg-navy/90 transition-colors"
                  aria-label="Profile options"
                >
                  {profileInitial}
                </button>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Account</DialogTitle>
                    <DialogDescription>Manage your admin account</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Button
                      className="w-full gap-2"
                      onClick={() => {
                        setProfileDialogOpen(false);
                        setChangePasswordOpen(true);
                      }}
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        setProfileDialogOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      {t('auth.logout')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t('admin.totalArticles')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {loading ? "…" : stats?.articles ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {t('admin.totalViews')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {loading ? "…" : formatNumber(stats?.totalViews)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {t('admin.activeUsers')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {loading ? "…" : stats?.admins ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t('admin.manageNews')}
                </CardTitle>
                <CardDescription>{t('admin.createEdit')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate("/admin/news")}>{t('admin.manageArticles')}</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary" />
                  {t('admin.manageMedia')}
                </CardTitle>
                <CardDescription>{t('admin.uploadMedia')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate("/admin/media")}>{t('admin.manageMedia')}</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  {t('admin.manageAds')}
                </CardTitle>
                <CardDescription>{t('admin.controlAds')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate("/admin/ads")}>{t('admin.manageAds')}</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  Manage Announcements
                </CardTitle>
                <CardDescription>Create, edit, and manage announcements</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate("/admin/announcements")}>Manage Announcements</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update your administrator password securely.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitPasswordChange}>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Current Password</label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange("currentPassword")}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                  onClick={() => setShowCurrent((prev) => !prev)}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">New Password</label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange("newPassword")}
                  minLength={6}
                  required
                  className="pr-10"
                /> 
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                  onClick={() => setShowNew((prev) => !prev)}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Confirm New Password</label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange("confirmPassword")}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                  onClick={() => setShowConfirm((prev) => !prev)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setChangePasswordOpen(false)}
                className="sm:w-32"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="sm:w-40"
                disabled={updatingPassword}
              >
                {updatingPassword ? "Updating..." : "Change Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
