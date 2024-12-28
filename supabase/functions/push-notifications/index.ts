import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { DateTime } from "luxon";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization")!;

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const today = DateTime.now().setZone("UTC");
    const formattedDate = today.toISODate();
    console.log("today", formattedDate);

    const { data: sessions } = await supabaseAdmin
      .from("sessions")
      .select("*, user:user_id(push_token)")
      .eq("scheduled_date", formattedDate)
      .eq("status", "scheduled");

    console.log("sessions", sessions);

    const notifications = sessions
      .filter((session) => session.user.push_token)
      .map((session) => {
        return {
          to: session.user.push_token,
          title: "Time for your Pilates session! 🧘‍♀️",
          body: "Your scheduled workout is ready to begin.",
          sound: "default",
        };
      });

    const response = await fetch(`https://exp.host/--/api/v2/push/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}`,
      },
      body: JSON.stringify(notifications),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
