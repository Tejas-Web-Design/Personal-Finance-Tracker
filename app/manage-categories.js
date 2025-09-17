import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../src/components/customButton";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem("categories");
      if (stored) {
        setCategories(JSON.parse(stored));
      } else {
        const defaultCats = ["🍔 Food", "🚌 Transport", "🛒 Shopping", "💡 Bills", "📦 Other"];
        setCategories(defaultCats);
        await AsyncStorage.setItem("categories", JSON.stringify(defaultCats));
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    const updated = [...categories, newCategory.trim()];
    setCategories(updated);
    setNewCategory("");
    await AsyncStorage.setItem("categories", JSON.stringify(updated));
  };

  const removeCategory = (cat) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${cat}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = categories.filter((c) => c !== cat);
            setCategories(updated);
            await AsyncStorage.setItem("categories", JSON.stringify(updated));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Manage Categories</Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder=" ⏩ Add new category..."
          value={newCategory}
          onChangeText={setNewCategory}
        />
        <CustomButton title="➕ Add" onPress={addCategory} />
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.categoryRow}>
            <Text style={styles.category}>{item}</Text>
            <CustomButton title="🗑 Delete" type="secondary" onPress={() => removeCategory(item)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fdfdfd" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  row: { flexDirection: "row", marginBottom: 15 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  category: { fontSize: 18 },
});





