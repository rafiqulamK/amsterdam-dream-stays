import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Image, Star, LayoutGrid, Search, Mail, Phone, Activity, FormInput, FileText, Users, Share2, ImageIcon, BarChart3, Palette } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
import BrandingSettingsEditor from './BrandingSettingsEditor';

const settingsGroups = [
  {
    id: 'appearance',
    title: 'Appearance',
    items: [
      { value: 'branding', label: 'Branding', icon: Palette, component: BrandingSettingsEditor },
      { value: 'hero', label: 'Hero', icon: Image, component: HeroSectionEditor },
      { value: 'sections', label: 'Sections', icon: LayoutGrid, component: SectionVisibilityManager },
    ],
  },
  {
    id: 'content',
    title: 'Content',
    items: [
      { value: 'featured', label: 'Featured', icon: Star, component: FeaturedPropertiesPicker },
      { value: 'pages', label: 'Pages', icon: FileText, component: CMSPagesManager },
      { value: 'media', label: 'Media', icon: ImageIcon, component: MediaLibraryManager },
    ],
  },
  {
    id: 'lead-capture',
    title: 'Lead Capture',
    items: [
      { value: 'lead-form', label: 'Lead Form', icon: FormInput, component: LeadFormConfigManager },
      { value: 'email', label: 'Email', icon: Mail, component: EmailNotificationSettings },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing & SEO',
    items: [
      { value: 'seo', label: 'SEO', icon: Search, component: SEOSettingsEditor },
      { value: 'pixel', label: 'FB Pixel', icon: Activity, component: FacebookPixelSettings },
      { value: 'analytics', label: 'Analytics', icon: BarChart3, component: GoogleAnalyticsSettings },
    ],
  },
  {
    id: 'contact',
    title: 'Contact & Social',
    items: [
      { value: 'contact', label: 'Contact', icon: Phone, component: ContactSettingsEditor },
      { value: 'social', label: 'Social', icon: Share2, component: SocialLinksEditor },
    ],
  },
  {
    id: 'users',
    title: 'User Management',
    items: [
      { value: 'users', label: 'Users', icon: Users, component: UserRolesManager },
    ],
  },
];

const allItems = settingsGroups.flatMap(group => group.items);

const AdminSettingsManager = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('branding');

  // Mobile: Use accordion layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {settingsGroups.map((group) => (
            <AccordionItem key={group.id} value={group.id}>
              <AccordionTrigger className="text-base font-semibold">
                {group.title}
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const Component = item.component;
                  return (
                    <Accordion key={item.value} type="single" collapsible>
                      <AccordionItem value={item.value} className="border rounded-lg px-3">
                        <AccordionTrigger className="py-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <span>{item.label}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <Component />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  }

  // Desktop: Use tabs layout
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          {allItems.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger 
                key={item.value} 
                value={item.value} 
                className="flex items-center gap-1"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {allItems.map((item) => {
          const Component = item.component;
          return (
            <TabsContent key={item.value} value={item.value} className="mt-6">
              <Component />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default AdminSettingsManager;
