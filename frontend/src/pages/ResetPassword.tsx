import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";
import { authAPI } from "@/lib/api";
import { ArrowLeft, Eye, EyeOff, Mail, KeyRound } from "lucide-react";

const ResetPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get username/email from location state if coming from forgot password
  const usernameFromState = location.state?.usernameOrEmail || "";

  const [formData, setFormData] = useState({
    usernameOrEmail: usernameFromState,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle OTP input with individual boxes
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    const numValue = value.replace(/\D/g, "");
    if (numValue.length > 1) return; // Only allow single digit

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = numValue;
    setOtpDigits(newOtpDigits);

    // Update combined OTP string
    const combinedOtp = newOtpDigits.join("");
    setFormData({ ...formData, otp: combinedOtp });

    // Auto-focus next input
    if (numValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste for OTP
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtpDigits = [...otpDigits];
    
    for (let i = 0; i < 6; i++) {
      newOtpDigits[i] = pastedData[i] || "";
    }
    
    setOtpDigits(newOtpDigits);
    setFormData({ ...formData, otp: pastedData });
    
    // Focus the last filled input or first empty
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    otpInputRefs.current[lastFilledIndex]?.focus();
  };

  // Handle backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.usernameOrEmail) {
      await Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please enter your username or email.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!formData.otp || formData.otp.length !== 6) {
      await Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please enter a valid 6-digit OTP.",
        confirmButtonColor: "#1e3a8a",
      });
      // Focus first OTP input
      otpInputRefs.current[0]?.focus();
      return;
    }

    if (formData.newPassword.length < 6) {
      await Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Password must be at least 6 characters long.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      await Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Passwords do not match.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPasswordWithOtp(formData.usernameOrEmail, formData.otp, formData.newPassword);
      
      await Swal.fire({
        icon: "success",
        title: "Password Reset Successful!",
        html: `
          <p>Your password has been reset successfully.</p>
          <p class="mt-2">You can now login with your new password.</p>
        `,
        confirmButtonColor: "#1e3a8a",
        confirmButtonText: "Go to Login",
      });

      navigate("/auth");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reset password. Please try again.";
      
      await Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: message,
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
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
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit OTP sent to your email and create a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email Field */}
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Username or Email
              </Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Enter your username or email"
                value={formData.usernameOrEmail}
                onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                required
                className="h-11"
              />
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                OTP Code
              </Label>
              <div className="flex justify-center gap-2">
                {otpDigits.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onPaste={handleOtpPaste}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold font-mono border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    autoFocus={index === 0 && !usernameFromState}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code sent to your email
                <br />
                <span className="text-primary font-medium">Valid for 10 minutes</span>
              </p>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  minLength={6}
                  required
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>

            {/* Links */}
            <div className="text-center space-y-2 pt-2">
              <Link 
                to="/auth/forgot-password" 
                state={{ usernameOrEmail: formData.usernameOrEmail }}
                className="text-sm text-primary hover:underline block"
              >
                Didn't receive OTP? Request again
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground block">
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
