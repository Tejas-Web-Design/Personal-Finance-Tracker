import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TextInput,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "expo-router"; 

export default function HomeScreen() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortType, setSortType] = useState("latest");
  const [categories, setCategories] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);

  // 🔹 Load expenses
  const loadExpenses = async () => {
    const data = await AsyncStorage.getItem("expenses");
    setExpenses(data ? JSON.parse(data) : []);
  };

  // 🔹 Load categories
  const loadCategories = async () => {
    const stored = await AsyncStorage.getItem("categories");
    if (stored) {
      setCategories(JSON.parse(stored));
    } else {
      const defaultCats = ["Food", "Transport", "Shopping", "Bills", "Other"];
      setCategories(defaultCats);
      await AsyncStorage.setItem("categories", JSON.stringify(defaultCats));
    }
  };

  const getTotal = () =>
    expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const loadData = async () => {
  try {
    const expData = await AsyncStorage.getItem("expenses");
    const catData = await AsyncStorage.getItem("categories");

    setExpenses(expData ? JSON.parse(expData) : []);
    setCategories(catData ? JSON.parse(catData) : []); // 👈 no auto defaults here
  } catch (e) {
    console.log("Error loading data", e);
  } finally {
    setLoading(false);
  }
};


  // 🔹 Initial load
  useEffect(() => {
    loadData();
  }, []);

  // 🔹 Refresh when Home gets focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // 🔹 Category icons
  const categoryIcons = {
    Food: "🍔",
    Transport: "🚌",
    Shopping: "🛒",
    Bills: "💡",
    Other: "📦",
  };

  // 🔹 Calculate totals
  const getTotals = () => {
    const today = new Date();
    let todayTotal = 0, weekTotal = 0, monthTotal = 0;

    expenses.forEach((exp) => {
      const expDate = new Date(exp.date);
      const amount = parseFloat(exp.amount);

      // Today
      if (
        expDate.getDate() === today.getDate() &&
        expDate.getMonth() === today.getMonth() &&
        expDate.getFullYear() === today.getFullYear()
      ) {
        todayTotal += amount;
      }

      // This Week
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      if (expDate >= startOfWeek && expDate <= endOfWeek) {
        weekTotal += amount;
      }

      // This Month
      if (
        expDate.getMonth() === today.getMonth() &&
        expDate.getFullYear() === today.getFullYear()
      ) {
        monthTotal += amount;
      }
    });

    return { todayTotal, weekTotal, monthTotal };
  };

  const { todayTotal, weekTotal, monthTotal } = getTotals();

  // 🔹 Selected period total
  let displayTotal = 0;
  if (period === "daily") displayTotal = todayTotal;
  else if (period === "weekly") displayTotal = weekTotal;
  else displayTotal = monthTotal;

  // 🔹 Apply search, filter & sort
  const filteredExpenses = expenses
    .filter((exp) =>
      exp.note?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((exp) =>
      filterCategory === "All" ? true : exp.category === filterCategory
    )
    .sort((a, b) =>
      sortType === "latest"
        ? new Date(b.date) - new Date(a.date)
        : b.amount - a.amount
    );

  // 🔹 Group by date
  const grouped = filteredExpenses.reduce((groups, exp) => {
    const dateKey = new Date(exp.date).toLocaleDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(exp);
    return groups;
  }, {});

  const sections = Object.keys(grouped)
    .sort((a, b) => new Date(b) - new Date(a))
    .map((date) => ({
      title: date,
      data: grouped[date],
    }));

  return (
    <View style={styles.container}>
      {/* Totals Section */}
      <View style={styles.totalsBox}>
        <Text style={styles.totalText}>💰 Today: ₹{todayTotal.toFixed(2)}</Text>
        <Text style={styles.totalText}>📆 This Week: ₹{weekTotal.toFixed(2)}</Text>
        <Text style={styles.totalText}>📊 This Month: ₹{monthTotal.toFixed(2)}</Text>
      </View>

      {/* Period Picker */}
      <Text style={styles.filterLabel}>View Period:</Text>
      <Picker
        selectedValue={period}
        style={styles.picker}
        onValueChange={(value) => setPeriod(value)}
      >
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="Monthly" value="monthly" />
      </Picker>

      <Text style={styles.totalText}>
        🔎 Selected Total ({period}): ₹{displayTotal.toFixed(2)}
      </Text>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="🔍 Search by note..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Category Filter */}
      <Text style={styles.filterLabel}>Filter by Category:</Text>
      <Picker
        selectedValue={filterCategory}
        style={styles.picker}
        onValueChange={(value) => setFilterCategory(value)}
      >
        <Picker.Item label="All" value="All" />
        {categories.map((cat, i) => (
          <Picker.Item key={i} label={cat} value={cat} />
        ))}
      </Picker>

      {/* Sort Toggle */}
      <Text style={styles.filterLabel}>Sort By:</Text>
      <Button
        title={sortType === "latest" ? "📅 Latest First" : "💰 Highest Amount"}
        onPress={() =>
          setSortType(sortType === "latest" ? "highest" : "latest")
        }
      />

      {/* Grouped Expense List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>📅 {title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.category}>
              {categoryIcons[item.category] || "📦"} {item.category} - ₹
              {item.amount}
            </Text>
            {item.note ? <Text style={styles.note}>📝 {item.note}</Text> : null}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No expenses found 🚫</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fdfdfd" },
  totalsBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  totalText: { fontSize: 16, fontWeight: "600", marginVertical: 3 },
  search: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterLabel: { fontWeight: "bold", marginTop: 10, marginBottom: 4 },
  picker: { backgroundColor: "#fff", borderRadius: 8, marginBottom: 10 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  item: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  category: { fontSize: 16, fontWeight: "bold" },
  note: { fontSize: 14, color: "#666" },
  empty: { textAlign: "center", marginTop: 20, color: "#888" },
});
