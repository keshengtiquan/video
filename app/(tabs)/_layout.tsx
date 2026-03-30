import SearchBar from "@/components/SearchBar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "blue",
        headerShadowVisible: false,
        headerTitle: "",
        header: () => (
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <SearchBar />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "电影",
          tabBarShowLabel: true,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="film" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tv"
        options={{
          title: "电视剧",
          tabBarShowLabel: true,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="television" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "历史",
          tabBarShowLabel: true,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="history" color={color} />
          ),
          header: () => (
            <View
              style={[
                styles.header,
                styles.historyHeader,
                { paddingTop: insets.top },
              ]}
            >
              <Text style={styles.headerTitle}>历史记录</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "设置",
          tabBarShowLabel: true,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
          header: () => (
            <View style={[styles.header, { paddingTop: insets.top }]}>
              <Text style={styles.headerTitle}>设置</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: "100%",
    backgroundColor: "#fff",
  },
  historyHeader: {
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});
