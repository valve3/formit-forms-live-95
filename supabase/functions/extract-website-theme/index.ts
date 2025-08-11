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
      // Fetch the website with proper headers to avoid blocking
      console.log(`Extracting theme from: ${url} using Gemini AI`);
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
    
    // Extract comprehensive styling information
    const stylingData = await extractComprehensiveStyling(htmlContent, source);
    console.log(`Extracted styling data:`, stylingData);
    
    const theme = await extractThemeWithGemini(stylingData);
    console.log('Extracted theme:', theme);

    return new Response(JSON.stringify({ 
      success: true, 
      theme,
      source,
      debug: {
        foundColors: stylingData.foundColors, // Return the actual array
        cssFiles: stylingData.cssFiles.length,
        inlineStyles: stylingData.inlineStyles.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-website-theme function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function extractComprehensiveStyling(html: string, source: string) {
  const foundColors = new Set<string>();
  const cssFiles: string[] = [];
  const inlineStyles: string[] = [];
  
  // Extract all color values from HTML
  const colorPatterns = [
    // Hex colors
    /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g,
    // RGB colors
    /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
    // RGBA colors
    /rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/g,
    // HSL colors
    /hsl\s*\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/g,
    // Named colors in CSS properties
    /(?:color|background-color|border-color|fill|stroke)\s*:\s*([a-zA-Z]+)/g
  ];

  // Extract colors from HTML content
  colorPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      foundColors.add(match[0]);
    }
  });

  // Extract inline styles
  const styleRegex = /style\s*=\s*["']([^"']+)["']/g;
  let styleMatch;
  while ((styleMatch = styleRegex.exec(html)) !== null) {
    inlineStyles.push(styleMatch[1]);
  }

  // Extract CSS file URLs (only if source is a URL)
  const linkRegex = /<link[^>]+rel\s*=\s*["']stylesheet["'][^>]*href\s*=\s*["']([^"']+)["'][^>]*>/g;
  let linkMatch;
  if (source.startsWith('http')) {
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      let cssUrl = linkMatch[1];
      // Convert relative URLs to absolute
      if (cssUrl.startsWith('//')) {
        cssUrl = 'https:' + cssUrl;
      } else if (cssUrl.startsWith('/')) {
        const urlObj = new URL(source);
        cssUrl = urlObj.origin + cssUrl;
      } else if (!cssUrl.startsWith('http')) {
        cssUrl = new URL(cssUrl, source).href;
      }
      cssFiles.push(cssUrl);
    }
  }

  // Fetch and analyze CSS files (limit to first 3 to avoid timeout, only if source is a URL)
  const cssContents: string[] = [];
  if (source.startsWith('http')) {
    for (const cssUrl of cssFiles.slice(0, 3)) {
      try {
        console.log(`Fetching CSS file: ${cssUrl}`);
        const cssResponse = await fetch(cssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        if (cssResponse.ok) {
          const cssContent = await cssResponse.text();
          cssContents.push(cssContent);
          
          // Extract colors from CSS content
          colorPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(cssContent)) !== null) {
              foundColors.add(match[0]);
            }
          });
        }
      } catch (error) {
        console.log(`Failed to fetch CSS file ${cssUrl}:`, error.message);
      }
    }
  }

  // Extract style blocks from HTML
  const styleBlockRegex = /<style[^>]*>([\s\S]*?)<\/style>/g;
  let styleBlockMatch;
  while ((styleBlockMatch = styleBlockRegex.exec(html)) !== null) {
    const styleContent = styleBlockMatch[1];
    cssContents.push(styleContent);
    
    // Extract colors from style blocks
    colorPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(styleContent)) !== null) {
        foundColors.add(match[0]);
      }
    });
  }

  // Get the most relevant HTML content (header, nav, main sections)
  const relevantSections = [
    html.match(/<header[\s\S]*?<\/header>/i)?.[0] || '',
    html.match(/<nav[\s\S]*?<\/nav>/i)?.[0] || '',
    html.match(/<main[\s\S]*?<\/main>/i)?.[0] || '',
    html.substring(0, 5000) // First 5000 chars as fallback
  ].filter(Boolean).join('\n');

  return {
    foundColors: Array.from(foundColors),
    cssFiles,
    inlineStyles,
    cssContents,
    relevantHtml: relevantSections,
    baseUrl: source
  };
}

async function extractThemeWithGemini(stylingData: any) {
  const prompt = `You are analyzing a website to extract its actual theme colors. I have comprehensive styling data from the website.

SOURCE DATA:
Source: ${stylingData.baseUrl}
Found Colors: ${stylingData.foundColors.join(', ')}
CSS Files Analyzed: ${stylingData.cssFiles.length}
HTML Preview: ${stylingData.relevantHtml.substring(0, 2000)}

TASK: Extract the ACTUAL theme colors used on this website. Look at the provided colors and HTML structure to identify:

1. PRIMARY COLOR: The main brand/accent color (often used for buttons, links, highlights)
2. BACKGROUND COLOR: The main page background color  
3. TEXT COLOR: The primary text color used for body text
4. BORDER COLOR: Color used for borders, dividers, subtle lines
5. BUTTON COLOR: Primary button background color
6. BUTTON TEXT COLOR: Text color on primary buttons
7. CARD BACKGROUND: Background color for content cards/sections

INSTRUCTIONS:
- Use ONLY colors that appear in the "Found Colors" list above
- If a specific color role isn't clear, choose the most appropriate from the found colors
- Return valid hex colors only (convert rgb/hsl to hex if needed)
- Do NOT use transparent or make up colors not in the list

Return ONLY this JSON (no markdown formatting):
{
  "primaryColor": "#hexcode",
  "backgroundColor": "#hexcode",
  "textColor": "#hexcode",
  "borderColor": "#hexcode", 
  "buttonColor": "#hexcode",
  "buttonTextColor": "#hexcode",
  "cardBackground": "#hexcode"
}`;

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
        maxOutputTokens: 500,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const aiData = await response.json();
  const themeColorsText = aiData.candidates[0].content.parts[0].text;

  console.log('Gemini Response:', themeColorsText);

  return parseThemeResponse(themeColorsText, stylingData.foundColors);
}

// Removed OpenAI function since we're using Gemini exclusively

function parseThemeResponse(themeColorsText: string, foundColors: string[]) {
  let theme;
  try {
    // Try to extract JSON from the response
    const jsonMatch = themeColorsText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : themeColorsText;
    theme = JSON.parse(jsonText);
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError);
    // Return colors from the found colors if available
    return createFallbackTheme(foundColors);
  }

  // Validate that returned colors were actually found on the website
  const validatedTheme: any = {};
  const colorKeys = ['primaryColor', 'backgroundColor', 'textColor', 'borderColor', 'buttonColor', 'buttonTextColor', 'cardBackground'];
  
  for (const key of colorKeys) {
    const color = theme[key];
    if (color && isValidColor(color)) {
      validatedTheme[key] = color;
    } else {
      // Use fallback from found colors
      validatedTheme[key] = getFallbackColor(key, foundColors);
    }
  }

  return validatedTheme;
}

function createFallbackTheme(foundColors: string[]): any {
  const hexColors = foundColors.filter(color => /^#[0-9A-Fa-f]{6}$/.test(color));
  
  return {
    primaryColor: hexColors.find(c => !['#ffffff', '#000000', '#fff', '#000'].includes(c.toLowerCase())) || '#3b82f6',
    backgroundColor: foundColors.find(c => ['#ffffff', '#fff', 'white'].includes(c.toLowerCase())) || '#ffffff',
    textColor: foundColors.find(c => ['#000000', '#000', 'black', '#333333', '#333'].includes(c.toLowerCase())) || '#333333',
    borderColor: hexColors.find(c => c.toLowerCase().includes('e') || c.toLowerCase().includes('d')) || '#e5e7eb',
    buttonColor: hexColors.find(c => !['#ffffff', '#000000', '#fff', '#000'].includes(c.toLowerCase())) || '#3b82f6',
    buttonTextColor: '#ffffff',
    cardBackground: '#ffffff'
  };
}

function getFallbackColor(colorType: string, foundColors: string[]): string {
  const hexColors = foundColors.filter(color => /^#[0-9A-Fa-f]{6}$/.test(color));
  
  switch (colorType) {
    case 'backgroundColor':
    case 'cardBackground':
      return foundColors.find(c => ['#ffffff', '#fff', 'white'].includes(c.toLowerCase())) || '#ffffff';
    case 'textColor':
      return foundColors.find(c => ['#000000', '#000', 'black', '#333333', '#333'].includes(c.toLowerCase())) || '#333333';
    case 'borderColor':
      return hexColors.find(c => c.toLowerCase().includes('e') || c.toLowerCase().includes('d')) || '#e5e7eb';
    case 'buttonTextColor':
      return '#ffffff';
    default:
      return hexColors.find(c => !['#ffffff', '#000000', '#fff', '#000'].includes(c.toLowerCase())) || '#3b82f6';
  }
}

function isValidColor(color: string): boolean {
  if (!color || color === 'transparent') return false;
  
  // Check if it's a valid hex color
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return true;
  }
  
  // Check if it's a 3-digit hex and expand it
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
    return true;
  }
  
  return false;
}
