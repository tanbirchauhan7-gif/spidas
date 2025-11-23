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
    
    // If webhook URL is not configured or invalid, just log and return success
    if (!webhookUrl || webhookUrl === 'Monitor' || !webhookUrl.startsWith('http')) {
      console.log('Google Sheets webhook not configured, skipping external logging');
      return new Response(
        JSON.stringify({ success: true, message: 'Alert received (Google Sheets logging disabled)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      // Don't throw, just log the error
      return new Response(
        JSON.stringify({ success: true, message: 'Alert received (Google Sheets logging failed)', warning: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Alert logged successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in log-alert function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    // Return 200 with error details instead of 500 to avoid breaking the dashboard
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
