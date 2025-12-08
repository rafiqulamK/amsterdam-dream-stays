import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const COOKIE_CONSENT_KEY = "haus_cookie_consent";

type ConsentStatus = "accepted" | "declined" | null;

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentStatus;
    if (!consent) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
    // Enable tracking scripts
    window.dispatchEvent(new CustomEvent("cookieConsentAccepted"));
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
    // Disable tracking scripts
    window.dispatchEvent(new CustomEvent("cookieConsentDeclined"));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                We use cookies
              </h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to improve your experience, analyze site traffic, and for marketing purposes. 
                By clicking "Accept", you consent to our use of cookies.{" "}
                <Link 
                  to="/page/cookies" 
                  className="text-primary hover:underline"
                >
                  Learn more
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                className="flex-1 md:flex-none"
              >
                Decline
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="flex-1 md:flex-none"
              >
                Accept
              </Button>
            </div>
            <button
              onClick={handleDecline}
              className="absolute top-2 right-2 md:hidden p-1 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

// Hook to check consent status
export const useCookieConsent = () => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    setHasConsent(consent === "accepted");

    const handleAccepted = () => setHasConsent(true);
    const handleDeclined = () => setHasConsent(false);

    window.addEventListener("cookieConsentAccepted", handleAccepted);
    window.addEventListener("cookieConsentDeclined", handleDeclined);

    return () => {
      window.removeEventListener("cookieConsentAccepted", handleAccepted);
      window.removeEventListener("cookieConsentDeclined", handleDeclined);
    };
  }, []);

  return hasConsent;
};
