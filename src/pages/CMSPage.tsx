import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import DOMPurify from "dompurify";

interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean | null;
}

const CMSPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { trackEvent } = useFacebookPixel();

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (fetchError || !data) {
        setError(true);
      } else {
        setPage(data);
        
        // Update document title and meta tags
        const pageTitle = data.meta_title || `${data.title} | Hause`;
        document.title = pageTitle;
        
        // Update OG meta tags for Facebook sharing
        updateMetaTag('og:title', pageTitle);
        updateMetaTag('og:description', data.meta_description || '');
        updateMetaTag('og:url', window.location.href);
        updateMetaTag('og:type', 'article');
        
        // Track page view for FB Ads with content details
        const isBlogPost = slug?.startsWith('blog-');
        trackEvent('ViewContent', {
          content_name: data.title,
          content_category: isBlogPost ? 'Blog Post' : 'Page',
          content_ids: [data.id],
          content_type: isBlogPost ? 'blog' : 'page',
        });
      }
      setLoading(false);
    };

    fetchPage();
  }, [slug, trackEvent]);

  // Helper to update meta tags
  const updateMetaTag = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Page not found</h1>
            <p className="text-muted-foreground mb-6">
              The page you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <Link to="/" className="inline-flex items-center text-primary hover:underline mb-6 text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>

        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">{page.title}</h1>
          
          {page.content && (
            <div 
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }}
            />
          )}
        </article>
      </div>

      <Footer />
    </div>
  );
};

export default CMSPage;
