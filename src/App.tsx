import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";
import WhatsAppButton from "@/components/WhatsAppButton";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import CMSPage from "./pages/CMSPage";
import BlogPage from "./pages/BlogPage";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
// TenantDashboard hidden from navigation
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to initialize tracking within the app context
const TrackingInitializer = () => {
  useFacebookPixel();
  useGoogleAnalytics();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TrackingInitializer />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/blog" element={<BlogPage />} />
              {/* Tenant route hidden */}
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/page/:slug" element={<CMSPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <WhatsAppButton />
            <CookieConsent />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
