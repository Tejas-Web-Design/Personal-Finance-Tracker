// app/charts.js
import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, ScrollView, StyleSheet, Button, Share } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PieChart, BarChart } from "react-native-chart-kit";

export default function ChartsScreen() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const data = await AsyncStorage.getItem("expenses");
    if (data) setExpenses(JSON.parse(data));
  };

  // 🔹 Group by category for this month
  const getCategoryTotals = () => {
    const today = new Date();
    const categoryTotals = {};

    expenses.forEach((exp) => {
      const expDate = new Date(exp.date);
      if (
        expDate.getMonth() === today.getMonth() &&
        expDate.getFullYear() === today.getFullYear()
      ) {
        categoryTotals[exp.category] =
          (categoryTotals[exp.category] || 0) + Number(exp.amount);
      }
    });

    return Object.keys(categoryTotals).map((cat, i) => ({
      name: cat,
      amount: categoryTotals[cat],
      color: chartColors[i % chartColors.length],
      legendFontColor: "#333",
      legendFontSize: 14,
    }));
  };

  // 🔹 Group by day for this week
  const getWeeklyData = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyTotals = Array(7).fill(0);

    expenses.forEach((exp) => {
      const expDate = new Date(exp.date);
      if (expDate >= startOfWeek && expDate <= today) {
        const dayIndex = expDate.getDay();
        dailyTotals[dayIndex] += Number(exp.amount);
      }
    });

    return {
      labels: days,
      datasets: [{ data: dailyTotals }],
    };
  };

  // 🔹 Convert to CSV and export
  const exportData = async () => {
    try {
      const data = await AsyncStorage.getItem("expenses");
      if (data) {
        const parsed = JSON.parse(data);

        // Prepare CSV
        const header = "Date,Category,Amount,Note";
        const rows = parsed.map(
          (exp) =>
            `${exp.date},${exp.category},${exp.amount},"${exp.note || ""}"`
        );
        const csv = [header, ...rows].join("\n");

        await Share.share({
          title: "Export Expenses (CSV)",
          message: csv,
        });
      } else {
        alert("No expenses to export 🚫");
      }
    } catch (error) {
      console.error("Export failed", error);
    }
  };

  // 🔹 Total monthly spending
  const totalSpent = expenses.reduce((sum, exp) => {
    const expDate = new Date(exp.date);
    const today = new Date();
    if (
      expDate.getMonth() === today.getMonth() &&
      expDate.getFullYear() === today.getFullYear()
    ) {
      return sum + Number(exp.amount);
    }
    return sum;
  }, 0);

  const chartColors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>💰 Total This Month: ₹{totalSpent}</Text>

      <Text style={styles.heading}>📊 Monthly Spending by Category</Text>
      {getCategoryTotals().length > 0 ? (
        <PieChart
          data={getCategoryTotals()}
          width={Dimensions.get("window").width - 20}
          height={220}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      ) : (
        <Text style={styles.noData}>No data yet 🚫</Text>
      )}

      <Text style={styles.heading}>📈 Weekly Spending</Text>
      {getWeeklyData().datasets[0].data.some((val) => val > 0) ? (
        <BarChart
          data={getWeeklyData()}
          width={Dimensions.get("window").width - 20}
          height={220}
          chartConfig={chartConfig}
          fromZero
        />
      ) : (
        <Text style={styles.noData}>No data yet 🚫</Text>
      )}

      {/* Export Button */}
      <View style={styles.exportBtn}>
        <Button title="📤 Export Data (CSV)" onPress={exportData} />
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fafafa",
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
  },
  noData: {
    textAlign: "center",
    color: "#888",
    marginBottom: 20,
  },
  exportBtn: {
    marginVertical: 20,
  },
});
