
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  formTitle: string;
  submissionData: Record<string, any>;
  submittedAt: string;
  formId: string;
}

// Security utility functions
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove dangerous characters
    .trim();
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

const sanitizeForHTML = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, formTitle, submissionData, submittedAt, formId }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !formTitle || !submissionData || !formId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email address
    if (!validateEmail(to)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the form exists and is published (security check)
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, title, status')
      .eq('id', formId)
      .eq('status', 'published')
      .single();

    if (formError || !form) {
      console.error('Form verification failed:', formError);
      return new Response(
        JSON.stringify({ error: "Form not found or not published" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Fetch form fields to get labels
    const { data: fields, error: fieldsError } = await supabase
      .from('form_fields')
      .select('id, label')
      .eq('form_id', formId);

    if (fieldsError) {
      console.error('Error fetching form fields:', fieldsError);
      throw fieldsError;
    }

    // Create a mapping of field IDs to labels
    const fieldLabels = fields?.reduce((acc, field) => {
      acc[field.id] = sanitizeInput(field.label);
      return acc;
    }, {} as Record<string, string>) || {};

    // Sanitize and format submission data for email
    const formattedData = Object.entries(submissionData)
      .map(([fieldId, value]) => {
        const label = fieldLabels[fieldId] || fieldId;
        const sanitizedLabel = sanitizeForHTML(label);
        const sanitizedValue = sanitizeForHTML(String(value || ''));
        return `<strong>${sanitizedLabel}:</strong> ${sanitizedValue}`;
      })
      .join('<br>');

    // Sanitize form title and other data
    const sanitizedFormTitle = sanitizeForHTML(sanitizeInput(formTitle));
    const formattedDate = new Date(submittedAt).toLocaleString();

    // Send email with rate limiting
    const emailResponse = await resend.emails.send({
      from: "Form Builder <noreply@formbuilder.com>",
      to: [to],
      subject: `New submission for ${sanitizedFormTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Form Submission</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">New Form Submission</h2>
            <h3 style="color: #1f2937;">Form: ${sanitizedFormTitle}</h3>
            <p><strong>Submitted at:</strong> ${formattedDate}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <h4 style="color: #1f2937;">Submission Data:</h4>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px;">
              ${formattedData}
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="font-size: 12px; color: #6b7280;">
              This email was automatically generated from your form submission system.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-form-email function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
