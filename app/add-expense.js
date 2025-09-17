import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import CustomButton from "../src/components/customButton";


export default function AddExpenseScreen() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  


  const saveExpense = async () => {
    if (!amount || isNaN(amount) || !category) {
      alert("⚠️ Please enter a valid amount and select a category");
      return;
    }

    try {
      const newExpense = {
        id: Date.now(),
        amount: parseFloat(amount),
        category,
        note,
        date: new Date().toISOString(),
      };

      // Get existing expenses
      const storedExpenses = await AsyncStorage.getItem("expenses");
      const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];

      // Add new one
      expenses.push(newExpense);

      // Save back
      await AsyncStorage.setItem("expenses", JSON.stringify(expenses));

      // Reset form
      setAmount("");
      setCategory("");
      setNote("");

      alert("Expense saved ✅");
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➕ Add Expense</Text>

      <TextInput
        style={styles.input}
        placeholder="₹ Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="📂 Select Category" value="" />
        <Picker.Item label="🍔 Food" value="Food" />
        <Picker.Item label="🚌 Transport" value="Transport" />
        <Picker.Item label="🏠 Rent" value="Rent" />
        <Picker.Item label="🎉 Entertainment" value="Entertainment" />
        <Picker.Item label="💊 Health" value="Health" />
        <Picker.Item label="🛒 Shopping" value="Shopping" />
        <Picker.Item label="💼 Other" value="Other" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="✎ Note (optional)"
        value={note}
        onChangeText={setNote}
      />

      <CustomButton title="💾 Save Expense" onPress={saveExpense} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#824ae2ff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
});
