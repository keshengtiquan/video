import { Movie } from "@/types/movie";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

interface MovieCardProps {
  movie: Movie;
  onPress?: (movie: Movie) => void;
}

export function MovieCard({ movie, onPress }: MovieCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(movie);
    } else {
      router.push({ pathname: "/search-result", params: { query: movie.title } });
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: movie.cover,
          headers: {
            Referer: movie.url,
          },
        }}
        style={styles.cover}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>{movie.rate}</Text>
          {movie.playable && (
            <View style={styles.playableBadge}>
              <Text style={styles.playableText}>可播放</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxWidth: "47%",
  },
  cover: {
    width: "100%",
    height: 210,
    backgroundColor: "#f0f0f0",
  },
  info: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 12,
    color: "#f5a623",
    fontWeight: "bold",
  },
  playableBadge: {
    marginLeft: 8,
    backgroundColor: "#4caf50",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playableText: {
    fontSize: 10,
    color: "#fff",
  },
});
