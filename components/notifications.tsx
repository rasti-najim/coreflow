import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Arrow } from "./arrow";
import * as Haptics from "expo-haptics";

interface NotificationsProps {
  onTimeSelected: (date: Date) => void;
}

export const Notifications = ({ onTimeSelected }: NotificationsProps) => {
  const [date, setDate] = useState(new Date());

  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDate(selectedDate);
      onTimeSelected(selectedDate);
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
          mode="time"
          is24Hour={false}
          onChange={onChange}
          style={styles.picker}
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
    width: 200,
    height: 200,
  },
  arrowContainer: {
    position: "absolute",
    bottom: 40,
    right: 24,
  },
});
