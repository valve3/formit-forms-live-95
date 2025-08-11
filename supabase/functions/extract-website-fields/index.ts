
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, html } = await req.json();

    if (!url && !html) {
      throw new Error('URL or HTML content is required');
    }

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    let htmlContent: string;
    let source: string;

    if (html) {
      // Use provided HTML directly
      htmlContent = html;
      source = 'provided HTML code';
      console.log(`Using provided HTML content: ${htmlContent.length} characters`);
    } else {
      // Fetch the website
      console.log(`Extracting form fields from: ${url}`);
      const websiteResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        }
      });

      if (!websiteResponse.ok) {
        throw new Error(`Failed to fetch website: ${websiteResponse.statusText}`);
      }

      htmlContent = await websiteResponse.text();
      source = url;
      console.log(`Fetched HTML content: ${htmlContent.length} characters`);
    }

    // Extract form fields using Gemini
    const formFields = await extractFormFieldsWithGemini(htmlContent, source);

    console.log('Extracted form fields:', formFields);

    return new Response(JSON.stringify({ 
      success: true, 
      fields: formFields,
      source
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-website-fields function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractFormRelatedContent(html: string): string {
  // Extract sections that are likely to contain forms
  const formSections = [];
  
  // Look for actual form elements first
  const formMatches = html.match(/<form[\s\S]*?<\/form>/gi);
  if (formMatches) {
    formSections.push(...formMatches);
  }
  
  // Look for input elements and their surrounding context
  const inputMatches = html.match(/<[^>]*(?:input|textarea|select|button)[^>]*>/gi);
  if (inputMatches) {
    inputMatches.forEach(match => {
      const index = html.indexOf(match);
      const start = Math.max(0, index - 500); // Get 500 chars before
      const end = Math.min(html.length, index + match.length + 500); // Get 500 chars after
      formSections.push(html.substring(start, end));
    });
  }
  
  // Look for common form-related class names and IDs
  const formClassRegex = /<[^>]*(?:class|id)="[^"]*(?:form|input|field|contact|subscribe|signup|login|register|checkout|search)[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/gi;
  const classMatches = html.match(formClassRegex);
  if (classMatches) {
    formSections.push(...classMatches);
  }
  
  // If we found form-related content, combine it
  if (formSections.length > 0) {
    const combined = formSections.join('\n\n').substring(0, 15000); // Increase limit to 15k chars
    console.log(`Extracted ${formSections.length} form-related sections, total length: ${combined.length}`);
    return combined;
  }
  
  // Fallback to first 15k characters if no specific form content found
  console.log('No specific form content found, using first 15k characters');
  return html.substring(0, 15000);
}

async function extractFormFieldsWithGemini(html: string, source: string) {
  // Focus on form-related content and increase limit
  const formRelatedContent = extractFormRelatedContent(html);
  
  console.log('Form-related content being analyzed:', formRelatedContent.substring(0, 1000) + '...');
  
  const prompt = `You are an expert at analyzing HTML to extract form fields. Analyze this HTML content and find ALL form inputs, selects, textareas, and buttons.

SOURCE: ${source}
HTML CONTENT: ${formRelatedContent}

CRITICAL: Look for ANY of these patterns (even if they look incomplete):
- <input> elements with ANY type attribute (text, email, number, password, hidden, etc.)
- <textarea> elements
- <select> elements with <option> children
- <button> elements (any type)
- Form elements with class names containing "form", "input", "field", "control"
- Input elements inside divs with form-related classes
- React/Vue component patterns like <Input>, <Select>, <TextField>, <FormControl>
- Elements with form-related attributes like name, placeholder, required, value
- Even partial or malformed HTML that contains input-like structures

TASK: Extract ALL possible form fields. Be very liberal in what you consider a form field.

For each field, determine:
1. FIELD TYPE: text, email, number, textarea, select, radio, checkbox, date, file, tel, url, password (default to "text" if unclear)
2. LABEL: Text content of associated <label>, nearby text, placeholder, or name attribute
3. PLACEHOLDER: Placeholder attribute value or similar hint text
4. REQUIRED: Check for required attribute, asterisk (*), or "required" in nearby text
5. OPTIONS: For select/radio/checkbox, extract option values and text

EXAMPLES:
- <input type="email" name="email" placeholder="Enter your email" required>
- <input type="text" class="form-control" placeholder="Full Name">
- <select name="country"><option value="us">United States</option></select>
- <textarea name="message" placeholder="Your message"></textarea>
- <div class="input-field"><input type="text" name="phone"></div>
- <input name="firstName" placeholder="First Name"> (assume text type)

Even if the HTML looks broken or incomplete, try to extract meaningful form fields from it.

If you find ANY form fields, return them as a JSON array. If absolutely no form fields are found, return an empty array [].

Return ONLY valid JSON (no markdown, no backticks, no extra text):
[
  {
    "field_type": "email",
    "label": "Email Address",
    "placeholder": "Enter your email",
    "required": true,
    "options": []
  }
]`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2000,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const aiData = await response.json();
  const fieldsText = aiData.candidates[0].content.parts[0].text;

  console.log('Gemini Response:', fieldsText);

  return parseFieldsResponse(fieldsText);
}

function parseFieldsResponse(fieldsText: string) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = fieldsText.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[0] : fieldsText;
    const fields = JSON.parse(jsonText);
    
    // Validate and clean up the fields
    return fields.filter((field: any) => 
      field.field_type && field.label
    ).map((field: any) => ({
      field_type: field.field_type,
      label: field.label,
      placeholder: field.placeholder || '',
      required: Boolean(field.required),
      options: field.options || undefined
    }));
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError);
    throw new Error('Failed to parse form fields from AI response');
  }
}
