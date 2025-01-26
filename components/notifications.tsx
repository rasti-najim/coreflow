import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Arrow } from "./arrow";
import * as Haptics from "expo-haptics";
import { DateTime } from "luxon";
import { getCalendars } from "expo-localization";

interface NotificationsProps {
  onTimeSelected: (time: { reminder_time: string; timezone: string }) => void;
}

export const Notifications = ({ onTimeSelected }: NotificationsProps) => {
  const [date, setDate] = useState(DateTime.now().toJSDate());

  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Convert to DateTime object
      const dt = DateTime.fromJSDate(selectedDate);

      // Format time as HH:mm (24-hour format)
      const timeString = dt.toFormat("HH:mm");

      // Get timezone from device using expo-localization
      const timezone = getCalendars()[0].timeZone;

      if (!timezone) {
        console.error("Could not determine timezone");
        return;
      }

      setDate(selectedDate);
      onTimeSelected({
        reminder_time: timeString, // Stored as "HH:mm"
        timezone: timezone, // Store timezone identifier (e.g., "America/New_York")
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 18,
    // fontWeight: "bold",
    marginBottom: 32,
    textAlign: "left",
  },
  pickerContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  picker: {
    width: "100%",
    height: "100%",
  },
  arrowContainer: {
    position: "absolute",
    bottom: 40,
    right: 24,
  },
});
