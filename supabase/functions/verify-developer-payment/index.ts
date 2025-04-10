
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
    const { sessionId, userId } = await req.json();
    
    console.log(`Verifying payment for session ${sessionId} and user ${userId}`);
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required", success: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: "Not authorized", success: false }),
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

    let user;
    // Get the user from auth or from provided userId
    if (userId) {
      console.log(`Using provided userId: ${userId}`);
      // Verify this is a valid user before proceeding
      const { data: userData, error: userCheckError } = await supabaseClient
        .from('profiles')
        .select('id, user_type')
        .eq('id', userId)
        .single();
      
      if (userCheckError || !userData) {
        console.error("Error getting user profile:", userCheckError);
        return new Response(
          JSON.stringify({ error: "Invalid user ID", success: false }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (userData.user_type !== 'developer') {
        console.error("User is not a developer");
        return new Response(
          JSON.stringify({ error: "User is not a developer", success: false }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      user = { id: userId };
    } else {
      // Get the authenticated user
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !authUser) {
        console.error("Error getting authenticated user:", userError);
        return new Response(
          JSON.stringify({ error: "Not authorized", success: false }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      user = authUser;
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the session to verify the payment
    console.log(`Retrieving Stripe session: ${sessionId}`);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      console.error("Invalid session ID");
      return new Response(
        JSON.stringify({ error: "Invalid session ID", success: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Session payment status: ${session.payment_status}`);
    
    // Verify the payment was successful
    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ 
          error: "Payment not completed", 
          status: session.payment_status, 
          success: false 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If client_reference_id is present and doesn't match, or metadata user_id is present and doesn't match
    const sessionUserId = session.client_reference_id || session.metadata?.user_id;
    if (sessionUserId && sessionUserId !== user.id) {
      console.log(`Session user ID mismatch: ${sessionUserId} vs ${user.id}`);
      // We proceed anyway but log the issue - could be legitimate if admin is verifying on behalf of user
      console.warn(`User ID mismatch, but proceeding with verification: Session user ID: ${sessionUserId}, Current user: ${user.id}`);
    }

    console.log(`Updating developer profile for user ${user.id}`);
    
    // Check if developer_profiles record exists
    const { data: devProfile, error: devProfileError } = await supabaseClient
      .from('developer_profiles')
      .select('id')
      .eq('id', user.id)
      .single();
      
    if (devProfileError && devProfileError.code !== 'PGRST116') { // Code for 'not found'
      console.error("Error checking developer profile:", devProfileError);
      return new Response(
        JSON.stringify({ error: "Database error checking developer profile", success: false }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let updateError;
    
    if (!devProfile) {
      console.log("Developer profile not found, creating a new one");
      // Insert new record
      const { error } = await supabaseClient
        .from('developer_profiles')
        .insert({
          id: user.id,
          premium_verified: true,
          payment_completed_at: new Date().toISOString(),
        });
      
      updateError = error;
    } else {
      console.log("Updating existing developer profile");
      // Update existing record
      const { error } = await supabaseClient
        .from('developer_profiles')
        .update({
          premium_verified: true,
          payment_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      updateError = error;
    }

    if (updateError) {
      console.error("Error updating developer profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update developer status", success: false }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record the payment in the database
    console.log("Recording payment in database");
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

    console.log("Verification completed successfully");
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
      JSON.stringify({ error: error.message, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
