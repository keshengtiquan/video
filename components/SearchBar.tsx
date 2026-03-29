import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";

export default function SearchBar() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/search")}
      activeOpacity={0.7}
    >
      <FontAwesome name="search" size={16} color="#999" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="搜索电影、电视剧..."
        placeholderTextColor="#999"
        editable={false}
        pointerEvents="none"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    width: "100%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
});
