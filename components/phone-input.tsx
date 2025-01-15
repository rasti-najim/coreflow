import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Country, CountrySelector } from "./country-selector";
import { COUNTRIES } from "./country-selector";

interface PhoneInputProps {
  phoneNumber: string;
  onChangePhoneNumber: (number: string) => void;
}

export const PhoneInput = ({
  phoneNumber,
  onChangePhoneNumber,
}: PhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    COUNTRIES.find((country) => country.name === "United States") || null
  );

  const handlePhoneChange = (text: string) => {
    // Remove any non-numeric characters and the country code if present
    const cleanNumber = text.replace(/[^0-9]/g, "");
    if (!selectedCountry) return;
    onChangePhoneNumber(`+${selectedCountry.dialCode}${cleanNumber}`);
  };

  // Remove country code from display value
  const displayValue = selectedCountry
    ? phoneNumber.replace(`+${selectedCountry.dialCode}`, "")
    : phoneNumber;

  return (
    <View style={styles.container}>
      <CountrySelector
        selectedCountry={selectedCountry}
        onSelect={setSelectedCountry}
      />
      <TextInput
        style={styles.phoneInput}
        placeholder="Enter phone number"
        placeholderTextColor="#666666"
        keyboardType="phone-pad"
        value={displayValue}
        onChangeText={handlePhoneChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: "500",
    borderBottomWidth: 1,
    borderBottomColor: "#4A2318",
  },
});
