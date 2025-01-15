import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { DateTime } from "luxon";
import { checkScheduleStatus } from "./schedule.ts";

Deno.serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id");

    if (usersError) throw usersError;

    let usersProcessed = 0;
    let schedulesExtended = 0;

    // Check each user's schedule
    for (const user of users) {
      try {
        const result = await checkScheduleStatus(supabaseAdmin, user.id);
        // Only increment if new sessions were created
        if (result && result.length > 0) schedulesExtended++;
        usersProcessed++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        usersProcessed,
        schedulesExtended,
        message: `Processed ${usersProcessed} users, extended ${schedulesExtended} schedules`,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
