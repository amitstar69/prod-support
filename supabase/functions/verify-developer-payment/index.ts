
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body for the session ID
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize the Supabase client with the user's token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    // Get the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the session to verify the payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Invalid session ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verify the payment was successful
    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed", status: session.payment_status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify this session belongs to the current user
    if (session.client_reference_id !== user.id && session.metadata?.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Session does not belong to the current user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the developer profile with verification details
    const { error: updateError } = await supabaseClient
      .from('developer_profiles')
      .update({
        premium_verified: true,
        payment_completed_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("Error updating developer profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update developer status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record the payment in the database
    const { error: paymentError } = await supabaseClient
      .from('developer_payments')
      .insert({
        developer_id: user.id,
        amount: 2999, // $29.99 in cents
        currency: "usd",
        payment_intent_id: session.payment_intent,
        payment_status: "completed"
      });

    if (paymentError) {
      console.error("Error recording payment:", paymentError);
      // Continue anyway as the verification was successful
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        verified: true,
        message: "Developer account verified successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
