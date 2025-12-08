import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, FileText, Eye, EyeOff, Save, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import DefaultEditor from 'react-simple-wysiwyg';

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  featured_image: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const CMSPagesManager = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    meta_title: '',
    meta_description: '',
    featured_image: '',
    is_published: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pages",
        variant: "destructive"
      });
    } else {
      setPages((data as Page[]) || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        slug: page.slug,
        title: page.title,
        content: page.content || '',
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        featured_image: page.featured_image || '',
        is_published: page.is_published
      });
    } else {
      setEditingPage(null);
      setFormData({
        slug: '',
        title: '',
        content: '',
        meta_title: '',
        meta_description: '',
        featured_image: '',
        is_published: false
      });
    }
    setDialogOpen(true);
  };

  const handleFeaturedImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    setUploadProgress(0);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `blog/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file);
    
    if (error) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive"
      });
    } else if (data) {
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, featured_image: urlData.publicUrl }));
      toast({
        title: "Success",
        description: "Featured image uploaded"
      });
    }
    
    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      toast({
        title: "Error",
        description: "Title and slug are required",
        variant: "destructive"
      });
      return;
    }

    const pageData = {
      slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
      title: formData.title,
      content: formData.content,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      featured_image: formData.featured_image || null,
      is_published: formData.is_published
    };

    if (editingPage) {
      const { error } = await supabase
        .from('pages')
        .update(pageData)
        .eq('id', editingPage.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update page",
          variant: "destructive"
        });
        return;
      }
    } else {
      const { error } = await supabase
        .from('pages')
        .insert([pageData]);

      if (error) {
        toast({
          title: "Error",
          description: error.message.includes('duplicate') 
            ? "A page with this slug already exists" 
            : "Failed to create page",
          variant: "destructive"
        });
        return;
      }
    }

    toast({
      title: "Success",
      description: `Page ${editingPage ? 'updated' : 'created'} successfully`
    });

    setDialogOpen(false);
    fetchPages();
  };

  const handleDelete = async (page: Page) => {
    if (!confirm(`Are you sure you want to delete "${page.title}"?`)) return;

    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', page.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Page deleted successfully"
      });
      fetchPages();
    }
  };

  const togglePublish = async (page: Page) => {
    const { error } = await supabase
      .from('pages')
      .update({ is_published: !page.is_published })
      .eq('id', page.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update page status",
        variant: "destructive"
      });
    } else {
      fetchPages();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CMS Pages
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? 'Edit Page' : 'Create New Page'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="About Us"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="about-us"
                  />
                </div>
              </div>

              {/* Featured Image Upload */}
              <div>
                <Label>Featured Image (for blog posts)</Label>
                <div className="mt-2 space-y-3">
                  {formData.featured_image ? (
                    <div className="relative inline-block">
                      <img 
                        src={formData.featured_image} 
                        alt="Featured" 
                        className="h-32 w-auto object-cover rounded border"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFeaturedImageUpload(e.target.files)}
                        className="hidden"
                        id="featured-image-upload"
                      />
                      <label htmlFor="featured-image-upload" className="cursor-pointer">
                        <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Upload featured image</p>
                      </label>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </div>
              </div>

              {/* Rich Text Editor */}
              <div>
                <Label htmlFor="content">Page Content</Label>
                <div className="mt-2 border rounded-md overflow-hidden">
                  <DefaultEditor
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    containerProps={{
                      style: {
                        minHeight: '300px',
                        resize: 'vertical'
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the toolbar to format text, add links, and create lists.
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">SEO Settings</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="Page Title | Hause"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_title.length}/60 characters
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Brief description for search engines..."
                      maxLength={160}
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_description.length}/160 characters
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label htmlFor="is_published">Publish Page</Label>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {editingPage ? 'Update Page' : 'Create Page'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading pages...</p>
        ) : pages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No pages created yet. Click "Add Page" to create your first page.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    {page.featured_image ? (
                      <img 
                        src={page.featured_image} 
                        alt={page.title}
                        className="w-12 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(page)}
                      className={page.is_published ? 'text-green-600' : 'text-muted-foreground'}
                    >
                      {page.is_published ? (
                        <><Eye className="h-4 w-4 mr-1" /> Published</>
                      ) : (
                        <><EyeOff className="h-4 w-4 mr-1" /> Draft</>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(page)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(page)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CMSPagesManager;
