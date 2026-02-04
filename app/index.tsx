import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StartScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tunnel Runner</Text>

      <Link href="/game" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/settings" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Einstellungen</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 40, fontWeight: "bold", marginBottom: 60 },
  button: {
    backgroundColor: "#000000ff",
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginVertical: 10,
    borderRadius: 10,
  },
  buttonText: { color: "white", fontSize: 20 },
});
