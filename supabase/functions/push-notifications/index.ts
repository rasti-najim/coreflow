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
    const now = DateTime.now().setZone("UTC");
    const currentHour = now.hour;
    const currentMinute = now.minute;
    const formattedDate = now.toISODate();
    console.log("today", formattedDate);

    const { data: sessions } = await supabaseAdmin
      .from("sessions")
      .select(
        "id, user:user_id (id, push_token, user_preferences!user_preferences_user_id_fkey (reminder_time, reminder_offset))"
      )
      .eq("scheduled_date", formattedDate)
      .eq("status", "scheduled")
      .eq("notification_sent", false);

    console.log("sessions", sessions);

    const notificationsToSend = sessions
      .filter((session) => {
        if (!session.user.push_token || !session.user.user_preferences)
          return false;

        const pref = session.user.user_preferences;
        const [hours, minutes] = pref.reminder_time.split(":").map(Number);

        // Create DateTime object in user's timezone
        const userLocalTime = DateTime.now()
          .setZone(pref.timezone)
          .set({ hour: hours, minute: minutes });

        // Get current time in UTC
        const now = DateTime.now().setZone("UTC");

        // Compare times
        return (
          now.hour === userLocalTime.hour && now.minute === userLocalTime.minute
        );
      })
      .map((session) => ({
        to: session.user.push_token,
        title: "Time for your Pilates session! 🧘‍♀️",
        body: "Your scheduled workout is ready to begin.",
        sound: "default",
        sessionId: session.id,
      }));

    if (notificationsToSend.length === 0) {
      return new Response(
        JSON.stringify({ message: "No notifications to send" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("notificationsToSend", notificationsToSend);

    // Send notifications
    const response = await fetch(`https://exp.host/--/api/v2/push/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}`,
      },
      body: JSON.stringify(notificationsToSend),
    });

    console.log("response", response);

    if (response.ok) {
      // Update notification_sent status for all sent notifications
      await supabaseAdmin
        .from("sessions")
        .update({ notification_sent: true })
        .in(
          "id",
          notificationsToSend.map((n) => n.sessionId)
        );
    }

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
