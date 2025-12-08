import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://haus.online";

const handler = async (req: Request): Promise<Response> => {
  console.log("Sitemap function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch approved properties
    const { data: properties } = await supabase
      .from("properties")
      .select("id, updated_at")
      .eq("status", "approved");

    // Fetch published pages
    const { data: pages } = await supabase
      .from("pages")
      .select("slug, updated_at")
      .eq("is_published", true);

    const today = new Date().toISOString().split("T")[0];

    // Static pages
    const staticUrls = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/blog", priority: "0.8", changefreq: "weekly" },
      { loc: "/auth", priority: "0.3", changefreq: "monthly" },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    for (const page of staticUrls) {
      xml += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add property pages
    if (properties) {
      for (const property of properties) {
        const lastmod = property.updated_at 
          ? new Date(property.updated_at).toISOString().split("T")[0] 
          : today;
        xml += `  <url>
    <loc>${SITE_URL}/property/${property.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
      }
    }

    // Add CMS pages
    if (pages) {
      for (const page of pages) {
        const lastmod = page.updated_at 
          ? new Date(page.updated_at).toISOString().split("T")[0] 
          : today;
        xml += `  <url>
    <loc>${SITE_URL}/page/${page.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    console.log(`Generated sitemap with ${staticUrls.length + (properties?.length || 0) + (pages?.length || 0)} URLs`);

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating sitemap:", errorMessage);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>${errorMessage}</error>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml", ...corsHeaders },
      }
    );
  }
};

serve(handler);
