import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Star, LayoutGrid, Search, Mail, Phone, Activity, FormInput, FileText, Users, Share2, ImageIcon, BarChart3 } from 'lucide-react';
import HeroSectionEditor from './HeroSectionEditor';
import FeaturedPropertiesPicker from './FeaturedPropertiesPicker';
import SectionVisibilityManager from './SectionVisibilityManager';
import SEOSettingsEditor from './SEOSettingsEditor';
import EmailNotificationSettings from './EmailNotificationSettings';
import ContactSettingsEditor from './ContactSettingsEditor';
import FacebookPixelSettings from './FacebookPixelSettings';
import GoogleAnalyticsSettings from './GoogleAnalyticsSettings';
import LeadFormConfigManager from './LeadFormConfigManager';
import CMSPagesManager from './CMSPagesManager';
import UserRolesManager from './UserRolesManager';
import SocialLinksEditor from './SocialLinksEditor';
import MediaLibraryManager from './MediaLibraryManager';

const AdminSettingsManager = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="hero" className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Featured</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-1">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Sections</span>
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Pages</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Media</span>
          </TabsTrigger>
          <TabsTrigger value="lead-form" className="flex items-center gap-1">
            <FormInput className="h-4 w-4" />
            <span className="hidden sm:inline">Lead Form</span>
          </TabsTrigger>
          <TabsTrigger value="pixel" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">FB Pixel</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-6">
          <HeroSectionEditor />
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          <FeaturedPropertiesPicker />
        </TabsContent>

        <TabsContent value="sections" className="mt-6">
          <SectionVisibilityManager />
        </TabsContent>

        <TabsContent value="pages" className="mt-6">
          <CMSPagesManager />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <MediaLibraryManager />
        </TabsContent>

        <TabsContent value="lead-form" className="mt-6">
          <LeadFormConfigManager />
        </TabsContent>

        <TabsContent value="pixel" className="mt-6">
          <FacebookPixelSettings />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <GoogleAnalyticsSettings />
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <SEOSettingsEditor />
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <EmailNotificationSettings />
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <ContactSettingsEditor />
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <SocialLinksEditor />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserRolesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettingsManager;
