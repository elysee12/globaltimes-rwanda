import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { authAPI } from "@/lib/api";

const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiration
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute

const SessionTimeoutWarning = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    let warningShown = false;
    let checkInterval: NodeJS.Timeout;

    const checkSession = async () => {
      try {
        const result = await authAPI.validateSession();
        if (!result.valid) {
          // Session expired
          await Swal.fire({
            icon: "warning",
            title: "Session Expired",
            text: "Your session has expired. Please login again.",
            confirmButtonColor: "#1e3a8a",
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
          navigate("/auth");
          return;
        }
      } catch (error) {
        // Session validation failed
        await Swal.fire({
          icon: "error",
          title: "Session Error",
          text: "Unable to validate session. Please login again.",
          confirmButtonColor: "#1e3a8a",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
        navigate("/auth");
      }
    };

    // Check session periodically
    checkInterval = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    // Show warning before expiration (if we can determine expiration time)
    const warningTimeout = setTimeout(async () => {
      if (!warningShown) {
        warningShown = true;
        const result = await Swal.fire({
          icon: "warning",
          title: "Session Expiring Soon",
          html: `
            <p>Your session will expire in 5 minutes.</p>
            <p class="mt-2">Would you like to extend your session?</p>
          `,
          showCancelButton: true,
          confirmButtonText: "Extend Session",
          cancelButtonText: "Logout Now",
          confirmButtonColor: "#1e3a8a",
          cancelButtonColor: "#dc2626",
        });

        if (result.isConfirmed) {
          // Validate session to update lastActivity
          await authAPI.validateSession();
          warningShown = false; // Reset to show warning again later
        } else {
          // User chose to logout
          await authAPI.logout();
          navigate("/auth");
        }
      }
    }, 19 * 60 * 1000); // Show warning at 19 minutes (5 min before 24h expiration)

    return () => {
      clearInterval(checkInterval);
      clearTimeout(warningTimeout);
    };
  }, [isActive, navigate]);

  useEffect(() => {
    // Only activate if we're on an admin page
    const isAdminPage = window.location.pathname.startsWith('/admin');
    const hasSession = !!localStorage.getItem('sessionId');
    setIsActive(isAdminPage && hasSession);
  }, []);

  return null; // This component doesn't render anything
};

export default SessionTimeoutWarning;

