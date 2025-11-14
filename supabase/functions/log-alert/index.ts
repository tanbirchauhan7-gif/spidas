import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertData {
  timestamp: string;
  type: string;
  message: string;
  sensor: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const alertData: AlertData = await req.json();
    console.log('Received alert data:', alertData);

    const webhookUrl = Deno.env.get('GOOGLE_SHEETS_WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.error('GOOGLE_SHEETS_WEBHOOK_URL not configured');
      return new Response(
        JSON.stringify({ error: 'Google Sheets webhook URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send data to Google Sheets via webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    });

    console.log('Google Sheets webhook response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets webhook error:', errorText);
      throw new Error(`Failed to log to Google Sheets: ${response.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Alert logged successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in log-alert function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
