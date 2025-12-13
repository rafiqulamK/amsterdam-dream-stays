import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin email addresses for notifications (used after domain verification)
const ADMIN_EMAILS = {
  info: "info@hause.ink",
  support: "support@hause.ink"
};

interface EmailRequest {
  type: 'lead' | 'booking' | 'test' | 'user_confirmation';
  to?: string;
  data: Record<string, string>;
}

// Logo URL - uses Supabase storage, with fallback to text if image fails
const LOGO_URL = "https://xrbbtqfbomsycghnzpqj.supabase.co/storage/v1/object/public/media/hause-logo.png";
const SITE_DOMAIN = "hause.link";

// Fallback logo HTML (text-based) for when image doesn't load
const getLogoHtml = () => `
  <div style="text-align: center; margin-bottom: 16px;">
    <img src="${LOGO_URL}" alt="Hause" style="max-width: 150px; height: auto;" 
         onerror="this.parentElement.innerHTML='<h2 style=\\'color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;\\'>🏠 Hause</h2>'" />
  </div>
`;

const getEmailTemplate = (type: string, data: Record<string, string>) => {
  const baseStyles = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  const headerStyles = `
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    padding: 32px;
    text-align: center;
  `;

  const contentStyles = `
    padding: 32px;
    color: #333;
    line-height: 1.6;
  `;

  const footerStyles = `
    background-color: #f8f9fa;
    padding: 24px;
    text-align: center;
    color: #666;
    font-size: 14px;
  `;

  const buttonStyles = `
    display: inline-block;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #ffffff;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    margin: 16px 0;
  `;

  const logoHtml = getLogoHtml();

  if (type === 'test') {
    return {
      subject: '🏠 Hause - Test Email',
      html: `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            ${logoHtml}
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hause</h1>
            <p style="color: #a0aec0; margin: 8px 0 0 0;">Premium Netherlands Rentals</p>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #1a1a2e; margin-top: 0;">✅ Email Configuration Successful!</h2>
            <p>This is a test email to confirm your email notifications are working correctly.</p>
            <div style="background-color: #f0f9ff; border-left: 4px solid #1a1a2e; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
              <strong>Test Details:</strong><br/>
              Name: ${data.name || 'N/A'}<br/>
              Email: ${data.email || 'N/A'}<br/>
              Message: ${data.message || 'N/A'}
            </div>
            <p>Your email notification system is now configured and ready to send notifications for new leads and bookings.</p>
          </div>
          <div style="${footerStyles}">
            <p style="margin: 0;">© ${new Date().getFullYear()} Hause</p>
            <p style="margin: 8px 0 0 0;">Wamelplein 68, 1106 Amsterdam, Netherlands</p>
          </div>
        </div>
      `
    };
  }

  if (type === 'lead') {
    return {
      subject: `🏠 New Lead: ${data.name} is interested!`,
      html: `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            ${logoHtml}
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">New Lead Received!</h1>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #1a1a2e; margin-top: 0;">📬 Someone is interested in your properties</h2>
            
            <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="margin: 0 0 16px 0; color: #1a1a2e;">Contact Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${data.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${data.email}" style="color: #1a1a2e;">${data.email || 'N/A'}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${data.phone || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Property:</strong></td>
                  <td style="padding: 8px 0;">${data.property || 'N/A'}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fefce8; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="margin: 0 0 12px 0; color: #854d0e;">💬 Message</h3>
              <p style="margin: 0; white-space: pre-wrap;">${data.message || 'No message provided'}</p>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
              <a href="mailto:${data.email}" style="${buttonStyles}">Reply to Lead</a>
            </div>
          </div>
          <div style="${footerStyles}">
            <p style="margin: 0;">© ${new Date().getFullYear()} Hause</p>
            <p style="margin: 8px 0 0 0;">Wamelplein 68, 1106 Amsterdam, Netherlands</p>
          </div>
        </div>
      `
    };
  }

  if (type === 'user_confirmation') {
    return {
      subject: `✅ Thank you for your application - Hause`,
      html: `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            ${logoHtml}
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hause</h1>
            <p style="color: #a0aec0; margin: 8px 0 0 0;">Premium Netherlands Rentals</p>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #1a1a2e; margin-top: 0;">Thank You, ${data.name || 'Valued Customer'}!</h2>
            <p>We've received your application and our team is reviewing it now.</p>
            
            <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #22c55e;">
              <h3 style="margin: 0 0 16px 0; color: #166534;">📋 Your Application Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;"><strong>Property:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;">${data.property || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;"><strong>Your Email:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;">${data.email || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;">${data.phone || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Desired Move Date:</strong></td>
                  <td style="padding: 8px 0;">${data.move_date || 'Not specified'}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="margin: 0 0 12px 0; color: #1a1a2e;">📌 What happens next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #64748b;">
                <li style="margin-bottom: 8px;">Our team will review your application within 24-48 hours</li>
                <li style="margin-bottom: 8px;">We may contact you for additional information if needed</li>
                <li style="margin-bottom: 8px;">You'll receive an update on the status of your application</li>
                <li>If approved, we'll schedule a viewing at your convenience</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
              <a href="https://${SITE_DOMAIN}" style="${buttonStyles}">Browse More Properties</a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
              If you have any questions, feel free to reply to this email or contact us at 
              <a href="mailto:${ADMIN_EMAILS.info}" style="color: #1a1a2e;">${ADMIN_EMAILS.info}</a>
            </p>
          </div>
          <div style="${footerStyles}">
            <p style="margin: 0;">© ${new Date().getFullYear()} Hause</p>
            <p style="margin: 8px 0 0 0;">Wamelplein 68, 1106 Amsterdam, Netherlands</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">
              You received this email because you submitted an application on our website.
            </p>
          </div>
        </div>
      `
    };
  }

  if (type === 'booking') {
    return {
      subject: `🏠 New Booking: ${data.property}`,
      html: `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            ${logoHtml}
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">New Booking Request!</h1>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #1a1a2e; margin-top: 0;">📅 A new booking has been submitted</h2>
            
            <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="margin: 0 0 16px 0; color: #166534;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;"><strong>Property:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;">${data.property || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;"><strong>Guest:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;">${data.guest_name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;"><strong>Check-in:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;">${data.start_date || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;"><strong>Check-out:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dcfce7;">${data.end_date || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Total Price:</strong></td>
                  <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #166534;">€${data.total_price || '0'}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
              <a href="https://${SITE_DOMAIN}/admin" style="${buttonStyles}">View in Dashboard</a>
            </div>
          </div>
          <div style="${footerStyles}">
            <p style="margin: 0;">© ${new Date().getFullYear()} Hause</p>
            <p style="margin: 8px 0 0 0;">Wamelplein 68, 1106 Amsterdam, Netherlands</p>
          </div>
        </div>
      `
    };
  }

  return { subject: 'Hause Notification', html: '<p>Notification</p>' };
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Email notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require JWT authentication for security
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.error("Authentication failed - no JWT provided");
    return new Response(
      JSON.stringify({ error: "Unauthorized - JWT required" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { type, to, data }: EmailRequest = await req.json();
    
    // Determine recipient - use provided 'to' or default to admin emails
    let recipient = to;
    if (!recipient) {
      // For admin notifications (leads, bookings), send to info@hause.ink
      recipient = ADMIN_EMAILS.info;
    }
    
    console.log(`Sending ${type} email to ${recipient}`);

    const template = getEmailTemplate(type, data);

    // Use hause.ink domain for sending after domain verification
    // Until domain is verified with Resend, use onboarding@resend.dev
    const fromEmail = "Hause <onboarding@resend.dev>"; // Change to "Hause <info@hause.ink>" after domain verification

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipient],
        reply_to: ADMIN_EMAILS.support,
        subject: template.subject,
        html: template.html,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Resend API error: ${errorData}`);
    }

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
