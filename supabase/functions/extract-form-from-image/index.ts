import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractedField {
  field_type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { value: string; text: string }[];
}

interface ExtractedTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  buttonColor: string;
  buttonTextColor: string;
  cardBackground: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert base64 image data to the format Gemini expects
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const prompt = `Analyze this image of a form and extract all form fields you can identify. Look for:

1. Input fields (text, email, number, password, etc.)
2. Textareas
3. Select dropdowns
4. Radio buttons
5. Checkboxes
6. Buttons

For each field, determine:
- Field type (text, email, number, textarea, select, radio, checkbox, date, file, tel, url, password)
- Label text (from labels, nearby text, or placeholders)
- Placeholder text if visible
- Whether it appears required (asterisk, "required" text, red styling)
- For select/radio/checkbox, extract all visible options

Also analyze the visual design and extract:
- Primary color (main brand color)
- Background color
- Text color
- Border color
- Button color
- Button text color
- Card/container background color

Return the response as a JSON object with two properties:
1. "fields": array of form fields
2. "theme": object with color information

Example format:
{
  "fields": [
    {
      "field_type": "text",
      "label": "Full Name",
      "placeholder": "Enter your full name",
      "required": true,
      "options": []
    },
    {
      "field_type": "select",
      "label": "Country",
      "placeholder": "Select your country",
      "required": false,
      "options": [
        {"value": "us", "text": "United States"},
        {"value": "ca", "text": "Canada"}
      ]
    }
  ],
  "theme": {
    "primaryColor": "#3b82f6",
    "backgroundColor": "#ffffff",
    "textColor": "#1f2937",
    "borderColor": "#d1d5db",
    "buttonColor": "#3b82f6",
    "buttonTextColor": "#ffffff",
    "cardBackground": "#f9fafb"
  }
}

Be thorough and extract as many form fields as possible. If you can't determine a specific field type, default to "text".`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini Response:', text);

    // Try to parse the JSON response
    let extractedData;
    try {
      // Clean the response text (remove markdown formatting if present)
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      extractedData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', text);
      
      // Return empty results if parsing fails
      extractedData = {
        fields: [],
        theme: {
          primaryColor: "#3b82f6",
          backgroundColor: "#ffffff",
          textColor: "#1f2937",
          borderColor: "#d1d5db",
          buttonColor: "#3b82f6",
          buttonTextColor: "#ffffff",
          cardBackground: "#f9fafb"
        }
      };
    }

    // Validate and clean the extracted data
    const fields: ExtractedField[] = (extractedData.fields || []).map((field: any) => ({
      field_type: field.field_type || 'text',
      label: field.label || '',
      placeholder: field.placeholder || '',
      required: Boolean(field.required),
      options: field.options || []
    }));

    const theme: ExtractedTheme = {
      primaryColor: extractedData.theme?.primaryColor || '#3b82f6',
      backgroundColor: extractedData.theme?.backgroundColor || '#ffffff',
      textColor: extractedData.theme?.textColor || '#1f2937',
      borderColor: extractedData.theme?.borderColor || '#d1d5db',
      buttonColor: extractedData.theme?.buttonColor || '#3b82f6',
      buttonTextColor: extractedData.theme?.buttonTextColor || '#ffffff',
      cardBackground: extractedData.theme?.cardBackground || '#f9fafb'
    };

    console.log('Extracted fields:', fields);
    console.log('Extracted theme:', theme);

    return new Response(
      JSON.stringify({
        fields,
        theme
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in extract-form-from-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process image', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});