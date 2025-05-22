import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get required environment variables
    const webhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');
    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!webhookSecret || !mpAccessToken || !supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables');
    }

    // Get the webhook signature and payload
    const signature = req.headers.get('x-signature');
    if (!signature) {
      throw new Error('Missing webhook signature');
    }

    const body = await req.text();
    
    // Validate webhook signature using HMAC SHA-256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const actualSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(body)
    );

    const expectedSignature = new Uint8Array(
      signature.split(',').map(byte => parseInt(byte))
    );

    const isValid = actualSignature.length === expectedSignature.length &&
      new Uint8Array(actualSignature).every((byte, i) => byte === expectedSignature[i]);

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse and validate the webhook payload
    const data = JSON.parse(body);
    if (!data.type || !data.data?.id) {
      throw new Error('Invalid webhook payload');
    }

    // Process payment notification
    if (data.type === 'payment') {
      const paymentId = data.data.id;
      
      // Fetch payment details from Mercado Pago
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

      // Start a transaction for payment processing
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('payments')
        .upsert({
          external_id: paymentId,
          user_id: userId,
          amount: payment.transaction_amount,
          currency: payment.currency_id,
          status: status,
          payment_method: payment.payment_type_id
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // If payment is approved, update subscription and profile
      if (status === 'approved') {
        // Create subscription
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: userId,
            plan_type: 'premium',
            status: 'active',
            start_date: new Date().toISOString(),
            payment_id: paymentRecord.id
          }]);

        if (subscriptionError) throw subscriptionError;

        // Update user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ has_paid_plan: true })
          .eq('id', userId);

        if (profileError) throw profileError;

        // Create initial nutritional plan
        const { data: registration } = await supabase
          .from('registrations')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (registration) {
          // Calculate daily calories based on user data
          const bmr = registration.gender === 'male'
            ? 88.362 + (13.397 * registration.weight) + (4.799 * registration.height) - (5.677 * registration.age)
            : 447.593 + (9.247 * registration.weight) + (3.098 * registration.height) - (4.330 * registration.age);

          let activityMultiplier = 1.2; // Sedentary
          if (registration.activity_level?.includes('Levemente ativo')) {
            activityMultiplier = 1.375;
          } else if (registration.activity_level?.includes('Moderadamente ativo')) {
            activityMultiplier = 1.55;
          } else if (registration.activity_level?.includes('Altamente ativo')) {
            activityMultiplier = 1.725;
          } else if (registration.activity_level?.includes('Extremamente ativo')) {
            activityMultiplier = 1.9;
          }

          const tdee = Math.round(bmr * activityMultiplier);
          let dailyCalories = tdee;

          // Adjust calories based on goal
          switch (registration.goal) {
            case 'emagrecer':
              dailyCalories = tdee - 500;
              break;
            case 'massa':
              dailyCalories = tdee + 500;
              break;
            case 'definicao':
              dailyCalories = tdee - 300;
              break;
            case 'definicao_massa':
              dailyCalories = tdee + 200;
              break;
          }

          // Create nutritional plan
          const { data: plan, error: planError } = await supabase
            .from('nutritional_plans')
            .insert([{
              user_id: userId,
              daily_calories: dailyCalories,
              protein_percentage: 30,
              carbs_percentage: 40,
              fat_percentage: 30,
              objective: registration.goal,
              start_date: new Date().toISOString()
            }])
            .select()
            .single();

          if (planError) throw planError;

          // Create plan objectives
          const { error: objectivesError } = await supabase
            .from('plan_objectives')
            .insert([{
              plan_id: plan.id,
              initial_weight: registration.weight,
              activity_level: registration.activity_level,
              weekly_goal: registration.goal === 'emagrecer' ? -0.5 : 
                          registration.goal === 'massa' ? 0.5 : 0
            }]);

          if (objectivesError) throw objectivesError;
        }
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