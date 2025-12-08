import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Newspaper, Calendar } from 'lucide-react';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  meta_description: string | null;
  featured_image: string | null;
  created_at: string;
}

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { trackEvent } = useFacebookPixel();

  useEffect(() => {
    document.title = 'News & Updates | Hause';
    
    trackEvent('ViewContent', {
      content_name: 'Blog Page',
      content_category: 'News',
    });

    const fetchBlogPosts = async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('id, slug, title, content, meta_description, featured_image, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPosts(data as BlogPost[]);
      }
      setLoading(false);
    };

    fetchBlogPosts();
  }, [trackEvent]);

  const getExcerpt = (content: string | null, description: string | null): string => {
    if (description) return description;
    if (!content) return '';
    const stripped = content.replace(/<[^>]*>/g, '');
    return stripped.length > 150 ? stripped.substring(0, 150) + '...' : stripped;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-20">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">News & Updates</h1>
        </div>
        <p className="text-muted-foreground mb-8">Stay informed with the latest rental market news and tips.</p>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 rounded-t-lg" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-medium mb-2">No news articles yet</h2>
            <p className="text-muted-foreground mb-6">Check back soon for updates and news.</p>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} to={`/page/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden">
                  {/* Featured Image */}
                  <div className="aspect-video bg-muted overflow-hidden">
                    {post.featured_image ? (
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <Newspaper className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {getExcerpt(post.content, post.meta_description)}
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Read more
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;