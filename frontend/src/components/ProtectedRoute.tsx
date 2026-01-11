import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { authAPI } from "@/lib/api";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      try {
        // Check if we have both token and session
        const hasToken = !!localStorage.getItem('authToken');
        const hasSession = !!localStorage.getItem('sessionId');
        
        if (!hasToken || !hasSession) {
          setIsAuthorized(false);
          setIsValidating(false);
          return;
        }

        // Validate session with backend
        const result = await authAPI.validateSession();
        if (result.valid) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          // Clear invalid session data
          localStorage.removeItem('authToken');
          localStorage.removeItem('sessionId');
          localStorage.removeItem('isAdminLoggedIn');
        }
      } catch (error) {
        setIsAuthorized(false);
        // Clear session data on error
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('isAdminLoggedIn');
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();

    // Listen for session expired events
    const handleSessionExpired = () => {
      setIsAuthorized(false);
    };

    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
