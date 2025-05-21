import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate webhook signature
    const signature = req.headers.get('x-signature');
    const webhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');
    
    if (!signature || !webhookSecret) {
      throw new Error('Missing webhook signature or secret');
    }

    const body = await req.text();
    const hmac = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      hmac,
      new TextEncoder().encode(body)
    );
    
    const actualSignature = new Uint8Array(
      signature.split(',').map(byte => parseInt(byte))
    );
    
    const isValid = expectedSignature.length === actualSignature.length &&
      expectedSignature.every((byte, i) => byte === actualSignature[i]);
    
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const data = JSON.parse(body);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process payment notification
    if (data.type === 'payment') {
      const paymentId = data.data.id;
      
      // Fetch payment details from Mercado Pago
      const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${mpAccessToken}`
          }
        }
      );
      
      if (!paymentResponse.ok) {
        throw new Error('Failed to fetch payment details');
      }
      
      const payment = await paymentResponse.json();
      const userId = payment.external_reference;
      const status = payment.status;

      // Update payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .upsert({
          external_id: paymentId,
          user_id: userId,
          amount: payment.transaction_amount,
          currency: payment.currency_id,
          status: status,
          payment_method: payment.payment_type_id
        });

      if (paymentError) throw paymentError;

      // If payment is approved, update subscription and profile
      if (status === 'approved') {
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: userId,
            plan_type: 'premium',
            status: 'active',
            start_date: new Date().toISOString()
          }]);

        if (subscriptionError) throw subscriptionError;

        const { error: profileError } = await supabase
          .from('profiles')
          .update({ has_paid_plan: true })
          .eq('id', userId);

        if (profileError) throw profileError;
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Webhook error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});