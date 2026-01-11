import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";
import { authAPI } from "@/lib/api";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.requestPasswordReset(usernameOrEmail);
      
      await Swal.fire({
        icon: "success",
        title: "OTP Sent Successfully!",
        html: `
          <p>If an account with that username or email exists, a 6-digit OTP has been sent to your email address.</p>
          <p class="mt-2 text-sm text-muted-foreground">Please check your email and enter the OTP on the next page.</p>
        `,
        confirmButtonColor: "#1e3a8a",
        confirmButtonText: "Continue to Reset Password",
      });

      // Navigate to reset password page with username/email in state
      navigate("/auth/reset-password", { state: { usernameOrEmail } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send OTP. Please try again.";
      
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your username or email address and we'll send you a 6-digit OTP to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Username or Email
              </Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Enter your username or email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                autoFocus
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Sending OTP...
                </span>
              ) : (
                "Send OTP"
              )}
            </Button>
            <div className="text-center">
              <Link to="/auth" className="text-sm text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
