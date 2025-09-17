import React from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import CustomButton from "../src/components/customButton";
export default function SettingsScreen() {
  const router = useRouter();

 const clearAllData = async () => {
  Alert.alert("Confirm", "Are you sure you want to clear all data?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Yes, Clear",
      onPress: async () => {
        try {
          await AsyncStorage.removeItem("expenses");
          await AsyncStorage.removeItem("categories");

          // 👇 force navigation refresh
          router.push("/");

          Alert.alert("Success", "All data cleared.");
        } catch (err) {
          Alert.alert("Error", "Something went wrong while clearing data.");
          console.error("Clear error:", err);
        }
      },
    },
  ]);
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <CustomButton
  title="📂 Manage Categories"
  onPress={() => router.push("/manage-categories")}
/>

<CustomButton
  title="🗑️ Clear All Data"
  type="secondary"
  onPress={clearAllData}
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: "#4CAF50",
  },
  dangerButton: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
