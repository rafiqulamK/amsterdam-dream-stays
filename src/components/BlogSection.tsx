import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, Newspaper, Calendar } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  meta_description: string | null;
  featured_image: string | null;
  created_at: string;
}

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('id, slug, title, content, meta_description, featured_image, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setPosts(data as BlogPost[]);
      }
      setLoading(false);
    };

    fetchBlogPosts();
  }, []);

  const getExcerpt = (content: string | null, description: string | null): string => {
    if (description) return description;
    if (!content) return '';
    const stripped = content.replace(/<[^>]*>/g, '');
    return stripped.length > 120 ? stripped.substring(0, 120) + '...' : stripped;
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-foreground text-center">Latest News</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Newspaper className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">Latest News</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
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

        <div className="text-center mt-8">
          <Link to="/blog">
            <Button variant="outline" size="lg" className="gap-2">
              View All News
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;