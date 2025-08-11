
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CaptchaRequest {
  token: string;
  action?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action = 'submit' }: CaptchaRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const recaptchaSecretKey = Deno.env.get("RECAPTCHA_SECRET_KEY");
    
    if (!recaptchaSecretKey) {
      console.error("RECAPTCHA_SECRET_KEY not configured");
      
      // For development/testing - accept any token that looks like a UUID
      if (token.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Development mode - CAPTCHA bypassed" 
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "CAPTCHA service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify with Google reCAPTCHA
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: recaptchaSecretKey,
        response: token,
      }),
    });

    const recaptchaResult = await recaptchaResponse.json();

    if (!recaptchaResult.success) {
      console.error('reCAPTCHA verification failed:', recaptchaResult['error-codes']);
      return new Response(
        JSON.stringify({ 
          error: "CAPTCHA verification failed",
          details: recaptchaResult['error-codes']
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Additional security checks
    if (recaptchaResult.score && recaptchaResult.score < 0.5) {
      return new Response(
        JSON.stringify({ 
          error: "CAPTCHA score too low",
          score: recaptchaResult.score
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (recaptchaResult.action && recaptchaResult.action !== action) {
      return new Response(
        JSON.stringify({ 
          error: "CAPTCHA action mismatch",
          expected: action,
          received: recaptchaResult.action
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        score: recaptchaResult.score,
        action: recaptchaResult.action,
        challenge_ts: recaptchaResult.challenge_ts,
        hostname: recaptchaResult.hostname
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in verify-captcha function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
