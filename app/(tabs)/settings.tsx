import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { usePlaySources } from "@/context/PlaySourceContext";

interface SourceItemProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

function SourceItem({ label, selected, onToggle }: SourceItemProps) {
  return (
    <TouchableOpacity style={styles.sourceItem} onPress={onToggle}>
      <Text style={styles.sourceLabel}>{label}</Text>
      <FontAwesome
        name={selected ? "check-square" : "square-o"}
        size={22}
        color={selected ? "#007aff" : "#999"}
      />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { selectedSources, toggleSource, sources } = usePlaySources();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>播放设置</Text>
          <View style={styles.settingCard}>
            <TouchableOpacity
              style={styles.settingHeader}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <View>
                <Text style={styles.settingLabel}>播放源</Text>
                <Text style={styles.settingSummary}>
                  已选择 {selectedSources.length} 项
                </Text>
              </View>
              <FontAwesome
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color="#999"
              />
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.sourceList}>
                {sources.map((source) => (
                  <SourceItem
                    key={source.value}
                    label={source.label}
                    selected={selectedSources.includes(source.value)}
                    onToggle={() => toggleSource(source.value)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 10,
    marginLeft: 4,
  },
  settingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  settingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  settingSummary: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  sourceList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
  },
  sourceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  sourceLabel: {
    fontSize: 15,
    color: "#333",
  },
});
