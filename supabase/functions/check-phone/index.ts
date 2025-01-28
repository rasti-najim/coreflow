import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization")!;

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const { phoneNumber } = await req.json();
    console.log("phoneNumber", phoneNumber);

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("phone_number", phoneNumber)
      .limit(1)
      .single();

    if (error) {
      throw error;
    }

    console.log("data", data);

    if (data) {
      return new Response(JSON.stringify({ exists: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ exists: false }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
});
