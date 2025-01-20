import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { Redirect } from "expo-router";
import { DateTime } from "luxon";
import { getCalendars } from "expo-localization";

export default function Page() {
  const { user } = useAuth();
  const safeArea = useSafeAreaInsets();
  const [date, setDate] = useState(DateTime.now().toJSDate());
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string | null>(null);
  const [initialTime, setInitialTime] = useState<string | null>(null);
  const [initialTimezone, setInitialTimezone] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  useEffect(() => {
    const fetchReminderSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("reminder_time, timezone")
          .eq("user_id", user.id)
          .limit(1)
          .single();

        if (error) {
          console.error(error);
          return;
        }

        if (data) {
          setReminderTime(data.reminder_time);
          setTimezone(data.timezone);
          setInitialTime(data.reminder_time);
          setInitialTimezone(data.timezone);
          if (data.reminder_time) {
            const [hours, minutes] = data.reminder_time.split(":");
            const newDate = DateTime.now().set({
              hour: parseInt(hours),
              minute: parseInt(minutes),
            });
            setDate(newDate.toJSDate());
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchReminderSettings();
  }, []);

  const hasChanges = () => {
    if (reminderTime !== initialTime) return true;
    if (timezone !== initialTimezone) return true;
    return false;
  };

  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Convert to DateTime object
      const dt = DateTime.fromJSDate(selectedDate);

      // Format time as HH:mm (24-hour format)
      const timeString = dt.toFormat("HH:mm");

      // Get timezone from device using expo-localization
      const deviceTimezone = getCalendars()[0].timeZone;

      if (!deviceTimezone) {
        console.error("Could not determine timezone");
        return;
      }

      setDate(selectedDate);
      setReminderTime(timeString);
      setTimezone(deviceTimezone);
    }
  };

  const handleSave = async () => {
    if (!reminderTime || !timezone) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .update({
          reminder_time: reminderTime,
          timezone: timezone,
        })
        .eq("user_id", user.id)
        .select();

      if (error) {
        console.error(error);
        return;
      }

      setInitialTime(reminderTime);
      setInitialTimezone(timezone);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (time: string) => {
    return DateTime.fromFormat(time, "HH:mm").toFormat("h:mm a");
  };

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 24 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>reminders</Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !hasChanges() && styles.saveButtonDisabled,
            isSaving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges() || isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        When should we remind you to flow? Think about what times you are
        typically motivated.
      </Text>

      <View style={styles.pickerContainer}>
        <DateTimePicker
          value={date}
          display="spinner"
          mode="time"
          is24Hour={false}
          onChange={onChange}
          style={styles.picker}
          themeVariant="light"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4A2318",
    fontFamily: "matolha-regular",
  },
  saveButton: {
    backgroundColor: "#4A2318",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFE9D5",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: 32,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: "left",
  },
  currentTime: {
    fontSize: 18,
    marginBottom: 24,
    color: "#4A2318",
  },
  pickerContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  picker: {
    width: "100%",
    height: 200,
  },
});
