import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "🏠 Home" }} />
      <Tabs.Screen name="add-expense" options={{ title: "💵Add Expense" }} />
      <Tabs.Screen name="settings" options={{ title: "🔧 Settings" }} />
      <Tabs.Screen name="manage-categories" options={{ title: "🌐 Manage Categories" }} />
      <Tabs.Screen name="charts" options={{ title: "📉 Charts" }} />
    </Tabs>
  );
}
