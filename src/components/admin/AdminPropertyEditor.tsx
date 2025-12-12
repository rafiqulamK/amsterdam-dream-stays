import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { X, Plus, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import VideoUploader from '@/components/VideoUploader';

interface Property {
  id?: string;
  title: string;
  description: string;
  city: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  property_type: string;
  available_from: string;
  amenities: string[];
  images: string[];
  videos?: string[];
  status?: string;
  owner_id?: string;
}

interface AdminPropertyEditorProps {
  property?: Property | null;
  onSave: () => void;
  onCancel: () => void;
}

const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Room', 'Villa', 'Penthouse'];
const CITIES = ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen'];
const COMMON_AMENITIES = ['WiFi', 'Parking', 'Balcony', 'Garden', 'Gym', 'Pool', 'Pet Friendly', 'Furnished', 'Washing Machine', 'Dishwasher', 'Air Conditioning', 'Heating'];

const AdminPropertyEditor = ({ property, onSave, onCancel }: AdminPropertyEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const [formData, setFormData] = useState<Property>({
    title: property?.title || '',
    description: property?.description || '',
    city: property?.city || '',
    location: property?.location || '',
    price: property?.price || 0,
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    area: property?.area || 0,
    property_type: property?.property_type || '',
    available_from: property?.available_from || new Date().toISOString().split('T')[0],
    amenities: property?.amenities || [],
    images: property?.images || [],
    videos: property?.videos || [],
    status: property?.status || 'approved',
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    const uploadedUrls: string[] = [];
    const totalFiles = files.length;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `properties/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file);
      
      if (error) {
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}: ${error.message}`,
          variant: "destructive"
        });
      } else if (data) {
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
        uploadedUrls.push(urlData.publicUrl);
      }
      
      setUploadProgress(((i + 1) / totalFiles) * 100);
    }
    
    if (uploadedUrls.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded`
      });
    }
    
    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      return;
    }

    if (!formData.title || !formData.city || !formData.property_type) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        city: formData.city,
        location: formData.location,
        price: formData.price,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: formData.area,
        property_type: formData.property_type,
        available_from: formData.available_from,
        amenities: formData.amenities,
        images: formData.images,
        videos: formData.videos,
        status: formData.status,
        owner_id: property?.id ? undefined : user.id,
      };

      if (property?.id) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', property.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Property updated successfully" });
      } else {
        const { error } = await supabase
          .from('properties')
          .insert({ ...propertyData, owner_id: user.id });
        
        if (error) throw error;
        toast({ title: "Success", description: "Property created successfully" });
      }

      onSave();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Beautiful apartment in city center"
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the property..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="city">City *</Label>
          <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">Address/Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Street address or neighborhood"
          />
        </div>

        <div>
          <Label htmlFor="property_type">Property Type *</Label>
          <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="price">Price (€/month) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            min={0}
            required
          />
        </div>

        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
            min={0}
          />
        </div>

        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
            min={0}
          />
        </div>

        <div>
          <Label htmlFor="area">Area (m²)</Label>
          <Input
            id="area"
            type="number"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
            min={0}
          />
        </div>

        <div>
          <Label htmlFor="available_from">Available From</Label>
          <Input
            id="available_from"
            type="date"
            value={formData.available_from}
            onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <Label>Amenities</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {COMMON_AMENITIES.map(amenity => (
            <Button
              key={amenity}
              type="button"
              variant={formData.amenities.includes(amenity) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleAmenity(amenity)}
            >
              {amenity}
            </Button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <Label>Images</Label>
        
        {/* File Upload */}
        <div className="mt-2 space-y-3">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload images</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
            </label>
          </div>
          
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading images...
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
        
        {/* URL Input (fallback) */}
        <div className="flex gap-2 mt-3">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Or paste image URL..."
            className="flex-1"
          />
          <Button type="button" onClick={addImageUrl} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Image Preview Grid */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
            {formData.images.map((url, index) => (
              <div key={index} className="relative group aspect-video">
                <img src={url} alt={`Property ${index + 1}`} className="w-full h-full object-cover rounded border" />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Videos */}
      <div>
        <Label>Videos (Optional)</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Upload property tour videos to showcase your listing
        </p>
        <VideoUploader
          videos={formData.videos || []}
          onVideosChange={(videos) => setFormData({ ...formData, videos })}
          maxVideos={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || uploading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {property?.id ? 'Update Property' : 'Create Property'}
        </Button>
      </div>
    </form>
  );
};

export default AdminPropertyEditor;