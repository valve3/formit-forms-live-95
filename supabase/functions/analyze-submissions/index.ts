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
    const { submissions, timeRange } = await req.json();

    if (!geminiApiKey) {
      console.error('Gemini API key not configured');
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!submissions || !Array.isArray(submissions)) {
      console.error('Invalid submissions data:', submissions);
      return new Response(JSON.stringify({ error: 'Invalid submissions data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process submissions data for AI analysis
    const totalSubmissions = submissions.length;
    
    if (totalSubmissions === 0) {
      return new Response(JSON.stringify({
        analysis: 'No submissions available for analysis. Start collecting form responses to generate insights.',
        stats: {
          totalSubmissions: 0,
          averageDaily: '0',
          topForm: 'No forms',
          formCount: 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formsData = submissions.reduce((acc: any, submission: any) => {
      const formTitle = submission.forms?.title || 'Unknown Form';
      if (!acc[formTitle]) {
        acc[formTitle] = { count: 0, recent: [] };
      }
      acc[formTitle].count++;
      acc[formTitle].recent.push(submission.submitted_at);
      return acc;
    }, {});

    // Get submission trends by date
    const submissionsByDate = submissions.reduce((acc: any, submission: any) => {
      const date = new Date(submission.submitted_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Calculate trends
    const dates = Object.keys(submissionsByDate).sort();
    const dailyCounts = dates.map(date => submissionsByDate[date]);
    const averageDaily = dailyCounts.length > 0 ? dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length : 0;

    // Create analysis prompt
    const analysisPrompt = `
    Analyze this form submission data and provide insights:
    
    Total Submissions: ${totalSubmissions}
    Time Range: ${timeRange || 'All time'}
    Average Daily Submissions: ${averageDaily.toFixed(1)}
    
    Form Breakdown:
    ${Object.entries(formsData).map(([form, data]: [string, any]) => 
      `- ${form}: ${data.count} submissions`
    ).join('\n')}
    
    Daily Submission Counts: ${dailyCounts.join(', ')}
    
    Please provide:
    1. A brief summary of the submission patterns
    2. Key insights about form performance
    3. Trends you notice in the data
    4. Recommendations for improving form conversion
    
    Keep the response concise and actionable, around 150-200 words.
    `;

    console.log('Sending analysis request to Gemini...');

    // Retry logic for Gemini API
    let response;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a data analyst specializing in form submission analytics. Provide clear, actionable insights based on the data provided.

${analysisPrompt}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
            },
          }),
        });

        if (response.ok) {
          break; // Success, exit retry loop
        }

        const errorText = await response.text();
        lastError = `Attempt ${attempt}: Gemini API error: ${response.status} - ${errorText}`;
        console.log(lastError);

        // If it's a 503 (overloaded) error, wait before retrying
        if (response.status === 503 && attempt < maxRetries) {
          const waitTime = attempt * 2000; // 2s, 4s, 6s
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else if (attempt === maxRetries) {
          // If all retries failed, provide fallback analysis
          console.log('All retries failed, providing fallback analysis');
          return new Response(JSON.stringify({
            analysis: `Analysis temporarily unavailable due to high demand. 

Based on your ${totalSubmissions} submissions across ${Object.keys(formsData).length} forms:

• Average daily submissions: ${averageDaily.toFixed(1)}
• Most active form: ${Object.entries(formsData).reduce((a: any, b: any) => a[1].count > b[1].count ? a : b)[0]}
• Recent activity shows consistent engagement

Recommendations:
1. Monitor peak submission times for optimal response
2. Consider form optimization for top-performing forms
3. Implement follow-up sequences for lead nurturing

Please try generating analysis again in a few minutes when the AI service recovers.`,
            stats: {
              totalSubmissions,
              averageDaily: averageDaily.toFixed(1),
              topForm: Object.entries(formsData).reduce((a: any, b: any) => a[1].count > b[1].count ? a : b)[0],
              formCount: Object.keys(formsData).length
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (fetchError: any) {
        lastError = `Attempt ${attempt}: Network error: ${fetchError.message}`;
        console.log(lastError);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts[0]) {
      console.error('Invalid Gemini API response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }
    
    const analysis = data.candidates[0].content.parts[0].text;

    console.log('Analysis generated successfully');

    // Calculate top form safely
    const formEntries = Object.entries(formsData);
    const topForm = formEntries.length > 0 
      ? formEntries.reduce((a: any, b: any) => a[1].count > b[1].count ? a : b)[0]
      : 'No forms';

    return new Response(JSON.stringify({ 
      analysis,
      stats: {
        totalSubmissions,
        averageDaily: averageDaily.toFixed(1),
        topForm,
        formCount: Object.keys(formsData).length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-submissions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});